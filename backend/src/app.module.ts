import * as dotenv from 'dotenv';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProductModule } from './modules/products/product.module';
import { DatabaseModule } from './models/database.module';
import { DataProcessingModule } from './modules/data-processing/data-processing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from './modules/accounts/account.module';
import { typeOrmConfig } from './config/typeorm.config';
import { NotificationModule } from './modules/notifications/notification.module';
import { ApiLoggerMiddleware } from './middlewares/api-logger.middleware';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_JWT,
      signOptions: { expiresIn: '7d' },
    }),
    ProductModule,
    AccountModule,
    DataProcessingModule,
    DatabaseModule,
    NotificationModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiLoggerMiddleware).forRoutes('*');
  }
}