/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import {
  checkDatabaseConnection,
  initializeDatabaseSchema,
  seedMockAccountNotifications,
  seedMockAccounts,
  seedMockNotifications,
  seedMockPlants,
  seedMockStores,
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
    const host = process.env.MYSQL_HOST;
    const port = Number(process.env.MYSQL_PORT);
    const user = process.env.MYSQL_USER;
    const password = process.env.MYSQL_PASSWORD;
    const dbName = process.env.MYSQL_DATABASE;

    // 1. Kiểm tra kết nối & 2. Khởi tạo Database nếu chưa tồn tại
    try {
      const connection = await checkDatabaseConnection(host!, port, user!, password);
      await initializeDatabaseSchema(connection, dbName!);
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

    // 4. Tự động kiểm tra và import dữ liệu seed nếu bảng notification trống
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await seedMockNotifications(this.pool);

    // 5. Tự động kiểm tra và import dữ liệu seed nếu bảng account_notification trống
    await seedMockAccountNotifications(this.pool);

    // 6. Tự động kiểm tra và import dữ liệu seed nếu bảng plant trống
    await seedMockPlants(this.pool);

    // 7. Tự động kiểm tra và import dữ liệu seed nếu bảng storeBranch trống
    await seedMockStores(this.pool);
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
