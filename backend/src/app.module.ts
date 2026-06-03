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
import { DataImportModule } from './modules/data-import/data-import.module';
import { BranchModule } from './modules/branches/branch.module';
import { PlantModule } from './modules/plants/plant.module';
import { ForecastingModule } from './modules/forecasting/forecasting.module';
import { AiInterpretationModule } from './modules/ai-interpretation/ai-interpretation.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LandingModule } from './modules/landing/landing.module';
import { ChatModule } from './modules/chat/chat.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SaleReportsModule } from './modules/sale-reports/sale-reports.module';
import { InventoryReportsModule } from './modules/inventory-reports/inventory-reports.module';

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
    DataImportModule,
    BranchModule,
    PlantModule,
    ForecastingModule,
    AiInterpretationModule,
    ReportsModule,
    LandingModule,
    ChatModule,
    SettingsModule,
    SaleReportsModule,
    InventoryReportsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiLoggerMiddleware).forRoutes('*');
  }
}
