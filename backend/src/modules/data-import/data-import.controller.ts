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

@UseGuards(authGuard.AuthGuard)
@Controller('import')
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

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
