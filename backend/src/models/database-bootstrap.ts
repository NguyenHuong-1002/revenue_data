import { Logger } from '@nestjs/common';
import { createConnection, Connection, Pool } from 'mysql2/promise';
import * as fs from 'node:fs';
import * as path from 'node:path';

const logger = new Logger('DatabaseBootstrap');

/**
 * Tìm đường dẫn chính xác của tệp init.sql bằng cách kiểm tra nhiều đường dẫn khả thi
 * (Hỗ trợ chạy trực tiếp ts-node, chạy bundle webpack, hoặc start từ các thư mục khác nhau)
 */
function findSqlPath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), '../database/init.sql'),
    path.resolve(__dirname, '../../database/init.sql'),
    path.resolve(__dirname, '../../../../database/init.sql'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  // Fallback mặc định
  return path.resolve(process.cwd(), '../database/init.sql');
}

/**
 * Tìm đường dẫn chính xác của tệp account.init.json
 */
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
  // Fallback mặc định
  return path.resolve(process.cwd(), 'src/data/account.init.json');
}

/**
 * 1. Kiểm tra kết nối cơ sở dữ liệu MySQL
 */
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

/**
 * 2. Khởi tạo cấu trúc Database & các bảng từ init.sql nếu chưa tồn tại
 */
export async function initializeDatabaseSchema(
  connection: Connection,
  dbName: string,
): Promise<void> {
  // Kiểm tra xem database có tồn tại hay không
  const [databases] = await connection.query<any[]>(`SHOW DATABASES LIKE ?`, [
    dbName,
  ]);
  const dbExists = databases.length > 0;

  let hasTables = false;
  if (dbExists) {
    // Kiểm tra xem database đã có bảng nào chưa
    const [tables] = await connection.query<any[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
      [dbName],
    );
    hasTables = tables.length > 0;
  }

  // Nếu database chưa tồn tại hoặc chưa có bất kỳ bảng nào, khởi tạo cấu trúc dữ liệu
  if (!dbExists || !hasTables) {
    const sqlPath = findSqlPath();
    logger.log(
      `Database '${dbName}' chưa khởi tạo hoặc rỗng. Đang tạo cấu trúc bảng từ init.sql tại: ${sqlPath}`,
    );
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      await connection.query(sql);
      logger.log(`Khởi tạo cấu trúc bảng từ init.sql thành công!`);
    } else {
      logger.error(`Không tìm thấy tệp SQL cấu trúc dữ liệu tại ${sqlPath}`);
    }
  } else {
    logger.log(`Cơ sở dữ liệu '${dbName}' đã tồn tại và có dữ liệu cấu trúc.`);
  }
}

/**
 * 3. Nạp (Seed) 10 tài khoản mẫu từ file JSON nếu bảng account đang trống
 */
export async function seedMockAccounts(pool: Pool): Promise<void> {
  try {
    const [accountCountRows] = await pool.query<any[]>(
      `SELECT COUNT(*) AS cnt FROM account`,
    );
    const accountCount = Number(accountCountRows[0].cnt);

    if (accountCount === 0) {
      const jsonPath = findJsonPath();
      logger.log(
        `Bảng account trống. Bắt đầu nạp 10 tài khoản mẫu từ account.init.json tại: ${jsonPath}`,
      );
      if (fs.existsSync(jsonPath)) {
        const accountsJson = fs.readFileSync(jsonPath, 'utf-8');
        const accounts = JSON.parse(accountsJson);

        for (const acc of accounts) {
          await pool.query(
            `INSERT INTO account (account_id, role, fullname, username, password_hash, mail, avatarURL, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              acc.account_id,
              acc.role,
              acc.fullname,
              acc.username,
              acc.password_hash,
              acc.mail,
              acc.avatarURL || '',
              acc.created_at ? new Date(acc.created_at) : new Date(),
              acc.updated_at ? new Date(acc.updated_at) : new Date(),
            ],
          );
        }
        logger.log(
          `Đã nạp thành công ${accounts.length} tài khoản mẫu vào bảng account!`,
        );
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
