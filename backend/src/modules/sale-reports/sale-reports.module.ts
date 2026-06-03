import { Module } from '@nestjs/common';
import { SaleReportsController } from './sale-reports.controller';
import { SaleReportsService } from './sale-reports.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [SaleReportsController],
  providers: [SaleReportsService],
  exports: [SaleReportsService],
})
export class SaleReportsModule {}
