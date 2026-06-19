import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as authGuard from 'src/middlewares/auth.guard';
import { DataImportService } from './data-import.service';

/**
 * Controller nhập dữ liệu từ file Excel
 * Routes: /import
 */
@UseGuards(authGuard.AuthGuard)
@Controller('import')
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

  /**
   * [ADMIN] Nhập dữ liệu sản phẩm từ file Excel
   * POST /import/products
   */
  @authGuard.Roles('ADMIN')
  @Post('products')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload tệp tin Excel!');
    }
    return this.dataImportService.importProducts(file.buffer);
  }

  /**
   * [ADMIN] Nhập dữ liệu bán hàng từ file Excel
   * POST /import/sales
   */
  @authGuard.Roles('ADMIN')
  @Post('sales')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importSaleReports(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload tệp tin Excel!');
    }
    return this.dataImportService.importSaleReports(file.buffer);
  }

  /**
   * [ADMIN] Nhập dữ liệu tồn kho từ file Excel
   * POST /import/inventory
   */
  @authGuard.Roles('ADMIN')
  @Post('inventory')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importInventoryReports(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload tệp tin Excel!');
    }
    return this.dataImportService.importInventoryReports(file.buffer);
  }
}
