import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleReportEntity } from '../../entities/sale-report.entity';
import { InventoryReportEntity } from '../../entities/inventory-report.entity';
import { ForecastingController } from './forecasting.controller';
import { ForecastingService } from './forecasting.service';

@Module({
  imports: [TypeOrmModule.forFeature([SaleReportEntity, InventoryReportEntity])],
  controllers: [ForecastingController],
  providers: [ForecastingService],
})
export class ForecastingModule {}
