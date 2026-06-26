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
  ValidationPipe,
} from '@nestjs/common';
import * as authGuard from 'src/guards/auth.guard';
import { SaleReportsService } from './sale-reports.service';
import { CreateSaleReportDto } from './dto/create-sale-report.dto';
import { GetSaleReportAllDto } from './dto/get-sale-report-all.dto';
import { ISaleReport } from './interfaces/sale-report.interface';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';

/**
 * Controller quản lý báo cáo bán hàng
 * Routes: /sale-reports
 */
@Controller('sale-reports')
export class SaleReportsController {
  constructor(private readonly saleReportsService: SaleReportsService) {}

  /**
   * Lấy danh sách báo cáo bán hàng (phân trang, lọc)
   * GET /sale-reports?page=1&limit=10&branch_id=xxx
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  getSaleReports(
    @Query(new ValidationPipe({ transform: true })) query: GetSaleReportAllDto,
  ): Promise<PaginatedResponseDto<ISaleReport>> {
    return this.saleReportsService.getSaleReportsAll(query);
  }

  /**
   * Lấy thống kê báo cáo bán hàng
   * GET /sale-reports/stats?range=week|month|quarter|year
   */
  @Get('/stats')
  @HttpCode(HttpStatus.OK)
  getSaleReportStats(@Query('range') range?: string): Promise<{
    distribution_channel: { name: string; count: number }[];
    monthly_sales: { name: string; count: number }[];
    top_branches: { name: string; count: number }[];
  }> {
    return this.saleReportsService.getSaleReportStats(range);
  }

  /**
   * Lấy thống kê doanh thu cho dashboard
   * GET /sale-reports/revenue-stats?range=week|month|quarter|year
   */
  @Get('/revenue-stats')
  @HttpCode(HttpStatus.OK)
  getRevenueDashboardStats(@Query('range') range?: string): Promise<{
    totalRevenue: number;
    growthRate: number;
    topProductByRevenue: {
      id: string;
      name: string;
      revenue: number;
      detail_product_group: string;
      gender: string;
      color: string;
      size: number;
    };
    topProductByQuantity: {
      id: string;
      name: string;
      quantity: number;
      detail_product_group: string;
      gender: string;
      color: string;
      size: number;
    };
  }> {
    return this.saleReportsService.getRevenueDashboardStats(range);
  }

  /**
   * Lấy thống kê sản phẩm nổi bật (top/bottom theo doanh thu, số lượng, tăng trưởng)
   * GET /sale-reports/highlight-products-stats?range=week|month|quarter|year
   */
  @Get('/highlight-products-stats')
  @HttpCode(HttpStatus.OK)
  getHighlightProductsStats(@Query('range') range?: string): Promise<{
    topRevenue: any[];
    bottomRevenue: any[];
    topQuantity: any[];
    bottomQuantity: any[];
    topGrowth: any[];
    bottomGrowth: any[];
  }> {
    return this.saleReportsService.getHighlightProductsStats(range);
  }

  /**
   * Lấy chi tiết báo cáo bán hàng theo ID
   * GET /sale-reports/:id
   */
  @Get('/:id')
  getSaleReportById(@Param('id') id: string): Promise<ISaleReport> {
    return this.saleReportsService.getDetailSaleReport(id);
  }

  /**
   * [ADMIN] Tạo báo cáo bán hàng mới
   * POST /sale-reports
   */
  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSaleReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateSaleReportDto,
  ): Promise<ISaleReport> {
    return this.saleReportsService.createSaleReport(dto, admin.username);
  }

  /**
   * [ADMIN] Cập nhật báo cáo bán hàng
   * PUT /sale-reports/:id
   */
  @authGuard.Roles('ADMIN')
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  updateSaleReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateSaleReportDto,
    @Param('id') id: string,
  ): Promise<ISaleReport> {
    return this.saleReportsService.updateSaleReport(dto, id, admin.username);
  }

  /**
   * [ADMIN] Xóa báo cáo bán hàng
   * DELETE /sale-reports/:id
   */
  @authGuard.Roles('ADMIN')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSaleReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.saleReportsService.deleteSaleReport(id, admin.username);
  }
}
