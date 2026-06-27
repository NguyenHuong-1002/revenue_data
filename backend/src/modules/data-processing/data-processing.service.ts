import { Injectable } from '@nestjs/common';
import { ProductImporterService } from './importers/product-importer.service';
import { SaleImporterService } from './importers/sale-importer.service';
import { InventoryImporterService } from './importers/inventory-importer.service';
import { ImportResult } from './interfaces/data.interface';

@Injectable()
export class DataProcessingService {
  constructor(
    private readonly productImporter: ProductImporterService,
    private readonly saleImporter: SaleImporterService,
    private readonly inventoryImporter: InventoryImporterService,
  ) {}

  async importProducts(
    filePath?: string | Buffer,
    bypassEmptyCheck = false,
  ): Promise<ImportResult> {
    return this.productImporter.importProducts(filePath, bypassEmptyCheck);
  }

  async importSaleReports(
    filePaths?: string[] | Buffer,
    bypassEmptyCheck = false,
  ): Promise<{ total: number; inserted: number; skipped: number }> {
    return this.saleImporter.importSaleReports(filePaths, bypassEmptyCheck);
  }

  async importInventoryReports(
    filePaths?: string[] | Buffer,
    bypassEmptyCheck = false,
  ): Promise<{ total: number; inserted: number; skipped: number }> {
    return this.inventoryImporter.importInventoryReports(filePaths, bypassEmptyCheck);
  }

  async importAll(): Promise<{
    product: ImportResult;
    sale: { total: number; inserted: number; skipped: number };
    inventory: { total: number; inserted: number; skipped: number };
  }> {
    const product = await this.productImporter.importProducts();
    const [sale, inventory] = await Promise.all([
      this.saleImporter.importSaleReports(),
      this.inventoryImporter.importInventoryReports(),
    ]);

    return { product, sale, inventory };
  }
}
