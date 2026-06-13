import { Injectable, Logger } from '@nestjs/common';
import { DataProcessingService } from '../data-processing/data-processing.service';

@Injectable()
export class DataImportService {
  private readonly logger = new Logger(DataImportService.name);

  constructor(private readonly dataProcessingService: DataProcessingService) {}

  /**
   * Nhập dữ liệu danh sách sản phẩm từ file Excel (Buffer) do Client tải lên
   * @param buffer Dữ liệu nhị phân của file Excel chứa danh sách sản phẩm
   * @returns Kết quả import gồm trạng thái thành công, thông điệp và số liệu thống kê (tổng số, số dòng đã thêm, số dòng bỏ qua)
   */
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

  /**
   * Nhập dữ liệu báo cáo bán hàng từ file Excel (Buffer) do Client tải lên
   * @param buffer Dữ liệu nhị phân của file Excel chứa báo cáo bán hàng
   * @returns Kết quả import gồm trạng thái thành công, thông điệp và số liệu thống kê (tổng số, số dòng đã thêm, số dòng bỏ qua)
   */
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

  /**
   * Nhập dữ liệu báo cáo tồn kho từ file Excel (Buffer) do Client tải lên
   * @param buffer Dữ liệu nhị phân của file Excel chứa báo cáo tồn kho
   * @returns Kết quả import gồm trạng thái thành công, thông điệp và số liệu thống kê (tổng số, số dòng đã thêm, số dòng bỏ qua)
   */
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
