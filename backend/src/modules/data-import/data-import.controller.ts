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
import { ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataImportService } from './data-import.service';

@ApiTags('Data Import')
@Controller('import')
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

  @Post('products')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file Excel để import danh sách Sản phẩm' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Import thành công' })
  @ApiResponse({ status: 400, description: 'File không hợp lệ hoặc thiếu file' })
  async uploadProducts(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload tệp tin Excel!');
    }
    return this.dataImportService.importProducts(file.buffer);
  }

  @Post('sales')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file Excel để import Báo cáo bán hàng (Sales)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Import thành công' })
  @ApiResponse({ status: 400, description: 'File không hợp lệ hoặc thiếu file' })
  async uploadSales(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload tệp tin Excel!');
    }
    return this.dataImportService.importSaleReports(file.buffer);
  }

  @Post('inventory')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file Excel để import Báo cáo tồn kho (Inventory)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Import thành công' })
  @ApiResponse({ status: 400, description: 'File không hợp lệ hoặc thiếu file' })
  async uploadInventory(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload tệp tin Excel!');
    }
    return this.dataImportService.importInventoryReports(file.buffer);
  }
}
