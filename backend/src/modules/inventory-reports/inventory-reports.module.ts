import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryReportsController } from './inventory-reports.controller';
import { InventoryReportsService } from './inventory-reports.service';
import { NotificationModule } from '../notifications/notifications.module';
import { InventoryReportEntity } from './entities/inventory-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryReportEntity]), NotificationModule],
  controllers: [InventoryReportsController],
  providers: [InventoryReportsService],
  exports: [InventoryReportsService],
})
export class InventoryReportsModule {}
