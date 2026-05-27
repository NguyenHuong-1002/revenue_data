import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import {
  checkDatabaseConnection,
  initializeDatabaseSchema,
  seedMockAccounts,
} from './database-bootstrap';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool?: Pool;

  private async checkConnection() {
    const connection = await this.client.getConnection();
    connection.release();
  }

  async onModuleInit() {
    const host = process.env.MYSQL_HOST ?? 'localhost';
    const port = Number(process.env.MYSQL_PORT ?? 3306);
    const user = process.env.MYSQL_USER ?? 'root';
    const password = process.env.MYSQL_PASSWORD ?? '';
    const dbName = process.env.MYSQL_DATABASE ?? 'revenue';

    // 1. Kiểm tra kết nối & 2. Khởi tạo Database nếu chưa tồn tại
    try {
      const connection = await checkDatabaseConnection(
        host,
        port,
        user,
        password,
      );
      await initializeDatabaseSchema(connection, dbName);
      await connection.end();
    } catch (err: any) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Lỗi trong quá trình kết nối/khởi tạo Database: ${err.message}`,
      );
    }

    // Khởi tạo Pool kết nối chính của ứng dụng
    this.pool = createPool({
      host,
      port,
      user,
      password,
      database: dbName,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
      queueLimit: 0,
    });

    await this.checkConnection();
    this.logger.log('Connected to MySQL database successfully');

    // 3. Tự động kiểm tra và import dữ liệu seed nếu bảng account trống
    await seedMockAccounts(this.pool);
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }
  /*
  async getAllAccounts() {
  // Dùng thẳng client (Pool). Nó tự mượn connection và tự trả.
  const [rows] = await this.databaseService.client.query('SELECT * FROM account');
  return rows;
} 
  */
  get client(): Pool {
    if (!this.pool) {
      throw new Error('MySQL pool has not been initialized');
    }
    return this.pool;
  }
  // Dùng riêng cho Transactions (Giao dịch phức tạp)
  getConnection(): Promise<PoolConnection> {
    return this.client.getConnection();
  }
}
