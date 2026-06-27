import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { SaleReportEntity } from '../sale-reports/entities/sale-report.entity';
import { InventoryReportEntity } from '../inventory-reports/entities/inventory-report.entity';
import { StoreBranchEntity } from '../branches/entities/branch.entity';
import { PlantEntity } from '../plants/entities/plant.entity';
import { DataProcessingService } from './data-processing.service';
import { ProductImporterService } from './importers/product-importer.service';
import { SaleImporterService } from './importers/sale-importer.service';
import { InventoryImporterService } from './importers/inventory-importer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      SaleReportEntity,
      InventoryReportEntity,
      StoreBranchEntity,
      PlantEntity,
    ]),
  ],
  providers: [
    ProductImporterService,
    SaleImporterService,
    InventoryImporterService,
    DataProcessingService,
  ],
  exports: [DataProcessingService],
})
export class DataProcessingModule {}
