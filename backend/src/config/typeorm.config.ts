import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  autoLoadEntities: true, //Tự động nạp các Entity)
  synchronize: false, //(Không tự động đồng bộ cấu hình bảng)
  migrations: [join(__dirname, '../migrations/*.ts')],
  migrationsRun: true, // tự động chạy run migrations khi nestjs start
};
