import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ProductModule } from './modules/products/products.module';
import { DatabaseModule } from './models/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from './modules/accounts/accounts.module';
import { NotificationModule } from './modules/notifications/notifications.module';
import { WinstonModule } from 'nest-winston';
import { ApiLoggerMiddleware } from './middleware/api-logger.middleware';
import { CorrelationIdMiddleware } from './global/correlation-id.middleware';
import { createWinstonLoggerOptions } from './global/logger.config';
import { DataImportModule } from './modules/data-import/data-import.module';
import { BranchModule } from './modules/branches/branches.module';
import { PlantModule } from './modules/plants/plants.module';
import { AiInterpretationModule } from './modules/ai-interpretation/ai-interpretation.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LandingModule } from './modules/landing/landing.module';
import { ChatModule } from './modules/chat/chat.module';
import { SaleReportsModule } from './modules/sale-reports/sale-reports.module';
import { InventoryReportsModule } from './modules/inventory-reports/inventory-reports.module';
import { HealthModule } from './modules/health/health.module';
import { envValidationSchema } from './config/env.validation';
import { TypeOrmConfigService } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: '.env',
    }),
    WinstonModule.forRoot(createWinstonLoggerOptions()),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_JWT,
      signOptions: { expiresIn: '7d' },
    }),
    ProductModule,
    AccountModule,
    DatabaseModule,
    NotificationModule,
    DataImportModule,
    BranchModule,
    PlantModule,
    AiInterpretationModule,
    ReportsModule,
    LandingModule,
    ChatModule,
    SaleReportsModule,
    InventoryReportsModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, ApiLoggerMiddleware).forRoutes('*');
  }
}
