import { Logger } from '@nestjs/common';
import { createConnection, Connection, Pool } from 'mysql2/promise';
import * as fs from 'node:fs';
import * as path from 'node:path';

const logger = new Logger('DatabaseBootstrap');

function findJsonPath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), 'src/data/account.init.json'),
    path.resolve(__dirname, '../data/account.init.json'),
    path.resolve(__dirname, '../../../src/data/account.init.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return path.resolve(process.cwd(), 'src/data/account.init.json');
}

export async function checkDatabaseConnection(
  host: string,
  port: number,
  user: string,
  password?: string,
): Promise<Connection> {
  logger.log(`Đang kiểm tra kết nối tới MySQL tại ${host}:${port}...`);
  return createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });
}

export async function initializeDatabaseSchema(
  connection: Connection,
  dbName: string,
): Promise<void> {
  const [databases] = await connection.query<any[]>(`SHOW DATABASES LIKE ?`, [dbName]);
  if (databases.length === 0) {
    logger.log(`Database '${dbName}' chưa tồn tại. Đang tạo...`);
    await connection.query(
      `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    logger.log(`Đã tạo database '${dbName}' thành công!`);
  } else {
    logger.log(`Database '${dbName}' đã tồn tại.`);
  }
}

export async function seedMockAccounts(pool: Pool): Promise<void> {
  try {
    const [accountCountRows] = await pool.query<any[]>(`SELECT COUNT(*) AS cnt FROM account`);
    const accountCount = Number(accountCountRows[0].cnt);

    if (accountCount === 0) {
      const jsonPath = findJsonPath();
      logger.log(`Bảng account trống. Bắt đầu nạp 10 tài khoản mẫu từ account.init.json tại: ${jsonPath}`);
      if (fs.existsSync(jsonPath)) {
        const accountsJson = fs.readFileSync(jsonPath, 'utf-8');
        const accounts = JSON.parse(accountsJson);

        for (const acc of accounts) {
          await pool.query(
            `INSERT INTO account (account_id, role_account, fullname, username, password_hash, mail, avatarURL, status_account, last_login_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              acc.account_id,
              acc.role || 'STAFF',
              acc.fullname,
              acc.username,
              acc.password_hash,
              acc.mail,
              acc.avatarURL || '',
              acc.status_account || 'ACTIVE',
              acc.last_login_at ? new Date(acc.last_login_at) : null,
              acc.created_at ? new Date(acc.created_at) : new Date(),
              acc.updated_at ? new Date(acc.updated_at) : new Date(),
            ],
          );
        }
        logger.log(`Đã nạp thành công ${accounts.length} tài khoản mẫu vào bảng account!`);
      } else {
        logger.error(`Không tìm thấy tệp tài khoản mẫu JSON tại ${jsonPath}`);
      }
    } else {
      logger.log('Bảng account đã có dữ liệu, bỏ qua bước seeding.');
    }
  } catch (err: any) {
    logger.error(`Lỗi khi nạp dữ liệu tài khoản mẫu: ${err.message}`);
  }
}

