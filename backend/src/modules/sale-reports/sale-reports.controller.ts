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
import { SaleReportsService } from './sale-reports.service';
import { CreateSaleReportDto } from './DTO/create-sale-report.dto';
import { GetSaleReportAllDto } from './DTO/get-sale-report-all.dto';
import { ISaleReport, IPaginatedSaleReports } from './interfaces/sale-report.interface';

@ApiTags('Quản lý báo cáo doanh số (Sale Reports)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard)
@Controller('sale-reports')
export class SaleReportsController {
  constructor(private readonly saleReportsService: SaleReportsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách báo cáo doanh số với phân trang và bộ lọc' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  getSaleReports(
    @Query(new ValidationPipe({ transform: true })) query: GetSaleReportAllDto,
  ): Promise<IPaginatedSaleReports> {
    return this.saleReportsService.getSaleReportsAll(query);
  }

  @Get('/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin thống kê báo cáo doanh số phục vụ vẽ biểu đồ' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công.' })
  getSaleReportStats(): Promise<any> {
    return this.saleReportsService.getSaleReportStats();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Lấy chi tiết báo cáo doanh số theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo.' })
  getDetailSaleReport(@Param('id') id: string): Promise<ISaleReport> {
    return this.saleReportsService.getDetailSaleReport(id);
  }

  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo mới một báo cáo doanh số (Chỉ dành cho ADMIN)' })
  @ApiResponse({ status: 201, description: 'Tạo mới thành công.' })
  createSaleReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateSaleReportDto,
  ): Promise<ISaleReport> {
    return this.saleReportsService.createSaleReport(dto, admin.username);
  }

  @authGuard.Roles('ADMIN')
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật một báo cáo doanh số (Chỉ dành cho ADMIN)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo.' })
  updateSaleReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateSaleReportDto,
    @Param('id') id: string,
  ): Promise<ISaleReport> {
    return this.saleReportsService.updateSaleReport(dto, id, admin.username);
  }

  @authGuard.Roles('ADMIN')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một báo cáo doanh số (Chỉ dành cho ADMIN)' })
  @ApiResponse({ status: 204, description: 'Xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo.' })
  deleteSaleReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.saleReportsService.deleteSaleReport(id, admin.username);
  }
}
