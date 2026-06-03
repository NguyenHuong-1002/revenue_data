import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as authGuard from 'src/middlewares/auth.guard';
import { InventoryReportsService } from './inventory-reports.service';
import { CreateInventoryReportDto } from './DTO/create-inventory-report.dto';
import { GetInventoryReportAllDto } from './DTO/get-inventory-report-all.dto';
import { IInventoryReport, IPaginatedInventoryReports } from './interfaces/inventory-report.interface';

@ApiTags('Quản lý báo cáo tồn kho (Inventory Reports)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard)
@Controller('inventory-reports')
export class InventoryReportsController {
  constructor(private readonly inventoryReportsService: InventoryReportsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách báo cáo tồn kho với phân trang và bộ lọc' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  getInventoryReports(
    @Query(new ValidationPipe({ transform: true })) query: GetInventoryReportAllDto,
  ): Promise<IPaginatedInventoryReports> {
    return this.inventoryReportsService.getInventoryReportsAll(query);
  }

  @Get('/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin thống kê báo cáo tồn kho phục vụ vẽ biểu đồ' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công.' })
  getInventoryReportStats(): Promise<any> {
    return this.inventoryReportsService.getInventoryReportStats();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Lấy chi tiết báo cáo tồn kho theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo.' })
  getDetailInventoryReport(@Param('id') id: string): Promise<IInventoryReport> {
    return this.inventoryReportsService.getDetailInventoryReport(id);
  }

  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo mới một báo cáo tồn kho (Chỉ dành cho ADMIN)' })
  @ApiResponse({ status: 201, description: 'Tạo mới thành công.' })
  createInventoryReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateInventoryReportDto,
  ): Promise<IInventoryReport> {
    return this.inventoryReportsService.createInventoryReport(dto, admin.username);
  }

  @authGuard.Roles('ADMIN')
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật một báo cáo tồn kho (Chỉ dành cho ADMIN)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo.' })
  updateInventoryReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateInventoryReportDto,
    @Param('id') id: string,
  ): Promise<IInventoryReport> {
    return this.inventoryReportsService.updateInventoryReport(dto, id, admin.username);
  }

  @authGuard.Roles('ADMIN')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một báo cáo tồn kho (Chỉ dành cho ADMIN)' })
  @ApiResponse({ status: 204, description: 'Xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo.' })
  deleteInventoryReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.inventoryReportsService.deleteInventoryReport(id, admin.username);
  }
}
