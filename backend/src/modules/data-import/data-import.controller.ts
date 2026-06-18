import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataImportService } from './data-import.service';

@Controller('import')
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

  @Post('products')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProducts(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload tệp tin Excel!');
    }
    return this.dataImportService.importProducts(file.buffer);
  }

  @Post('sales')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSales(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload tệp tin Excel!');
    }
    return this.dataImportService.importSaleReports(file.buffer);
  }

  @Post('inventory')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadInventory(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload tệp tin Excel!');
    }
    return this.dataImportService.importInventoryReports(file.buffer);
  }
}
