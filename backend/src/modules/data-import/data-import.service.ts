import { Injectable, Logger } from '@nestjs/common';
import { DataProcessingService } from '../data-processing/data-processing.service';

@Injectable()
export class DataImportService {
  private readonly logger = new Logger(DataImportService.name);

  constructor(private readonly dataProcessingService: DataProcessingService) {}

  async importProducts(buffer: Buffer) {
    this.logger.log('Bắt đầu import Products từ Client upload...');
    const result = await this.dataProcessingService.importProducts(buffer, true);
    return {
      success: true,
      message: 'Import danh sách sản phẩm thành công!',
      stats: {
        total: result.total,
        inserted: result.inserted,
        skipped: result.skipped,
      },
    };
  }

  async importSaleReports(buffer: Buffer) {
    this.logger.log('Bắt đầu import Sale Reports từ Client upload...');
    const result = await this.dataProcessingService.importSaleReports(buffer, true);
    return {
      success: true,
      message: 'Import báo cáo bán hàng thành công!',
      stats: {
        total: result.total,
        inserted: result.inserted,
        skipped: result.skipped,
      },
    };
  }

  async importInventoryReports(buffer: Buffer) {
    this.logger.log('Bắt đầu import Inventory Reports từ Client upload...');
    const result = await this.dataProcessingService.importInventoryReports(buffer, true);
    return {
      success: true,
      message: 'Import báo cáo tồn kho thành công!',
      stats: {
        total: result.total,
        inserted: result.inserted,
        skipped: result.skipped,
      },
    };
  }
}
