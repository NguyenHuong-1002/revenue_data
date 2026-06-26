import { config } from 'dotenv';
config();
import { join } from 'node:path';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [join(__dirname, '../modules/**/*.entity.ts')],
  migrations: [join(__dirname, '../migrations/*.ts')],
  migrationsTableName: 'typeorm_migrations',
});

// file này cấu hình cho generate/run migrations
