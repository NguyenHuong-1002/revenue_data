import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import {
  checkDatabaseConnection,
  initializeDatabaseSchema,
  seedMockAccounts,
} from './database-bootstrap';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool?: Pool;

  constructor(private readonly configService: ConfigService) {}

  private async checkConnection() {
    const connection = await this.client.getConnection();
    connection.release();
  }

  async onModuleInit() {
    const host = this.configService.get<string>('MYSQL_HOST')!;
    const port = this.configService.get<number>('MYSQL_PORT')!;
    const user = this.configService.get<string>('MYSQL_USER')!;
    const password = this.configService.get<string>('MYSQL_PASSWORD')!;
    const dbName = this.configService.get<string>('MYSQL_DATABASE')!;

    try {
      const connection = await checkDatabaseConnection(host!, port, user!, password);
      await initializeDatabaseSchema(connection, dbName!);
      await connection.end();
    } catch (err: any) {
      this.logger.error(
        `Lỗi trong quá trình kết nối/khởi tạo Database: ${err.message}`,
      );
    }

    this.pool = createPool({
      host,
      port,
      user,
      password,
      database: dbName,
      waitForConnections: true,
      connectionLimit: this.configService.get<number>('MYSQL_CONNECTION_LIMIT') ?? 10,
      queueLimit: 0,
    });

    await this.checkConnection();
    this.logger.log('Connected to MySQL database successfully');

    await seedMockAccounts(this.pool);
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  get client(): Pool {
    if (!this.pool) {
      throw new Error('MySQL pool has not been initialized');
    }
    return this.pool;
  }

  getConnection(): Promise<PoolConnection> {
    return this.client.getConnection();
  }
}
