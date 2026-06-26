import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleReportsController } from './sale-reports.controller';
import { SaleReportsService } from './sale-reports.service';
import { NotificationModule } from '../notifications/notifications.module';
import { SaleReportEntity } from './entities/sale-report.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { StoreBranchEntity } from '../branches/entities/branch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaleReportEntity, ProductEntity, StoreBranchEntity]),
    NotificationModule,
  ],
  controllers: [SaleReportsController],
  providers: [SaleReportsService],
  exports: [SaleReportsService],
})
export class SaleReportsModule {}
