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
import * as authGuard from '@/guards/auth.guard';
import { InventoryReportsService } from './inventory-reports.service';
import { CreateInventoryReportDto } from './dto/create-inventory-report.dto';
import { GetInventoryReportAllDto } from './dto/get-inventory-report-all.dto';
import { IInventoryReport } from './interfaces/inventory-report.interface';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';

/**
 * Controller quản lý báo cáo tồn kho
 * Routes: /inventory-reports
 */
@Controller('inventory-reports')
export class InventoryReportsController {
  constructor(private readonly inventoryReportsService: InventoryReportsService) {}

  /**
   * Lấy danh sách báo cáo tồn kho (phân trang, lọc)
   * GET /inventory-reports?page=1&limit=10&plant_id=xxx
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  getInventoryReports(
    @Query(new ValidationPipe({ transform: true })) query: GetInventoryReportAllDto,
  ): Promise<PaginatedResponseDto<IInventoryReport>> {
    return this.inventoryReportsService.getInventoryReportsAll(query);
  }

  /**
   * Lấy thống kê báo cáo tồn kho
   * GET /inventory-reports/stats
   */
  @Get('/stats')
  @HttpCode(HttpStatus.OK)
  getInventoryReportStats(): Promise<{
    plant_inventory: { name: string; count: number }[];
    monthly_inventory: { name: string; count: number }[];
  }> {
    return this.inventoryReportsService.getInventoryReportStats();
  }

  /**
   * Lấy KPIs tồn kho (tổng tồn, tăng trưởng, top nhà máy/sản phẩm)
   * GET /inventory-reports/kpis
   */
  @Get('/kpis')
  @HttpCode(HttpStatus.OK)
  getInventoryKpis(): Promise<{
    totalStock: number;
    totalRecords: number;
    totalPlants: number;
    totalProducts: number;
    currentMonthStock: number;
    previousMonthStock: number;
    growthPercent: number | null;
    topPlant: { plant_id: string; total: number } | null;
    topProduct: { product_id: string; total: number } | null;
    avgStockPerPlant: number;
  }> {
    return this.inventoryReportsService.getInventoryKpis();
  }

  /**
   * Lấy bảng xếp hạng tồn kho (top/bottom sản phẩm, nhà máy, xu hướng)
   * GET /inventory-reports/rankings?topN=10
   */
  @Get('/rankings')
  @HttpCode(HttpStatus.OK)
  getInventoryRankings(@Query('topN') topN?: string): Promise<{
    topStocked: { product_id: string; total: number }[];
    bottomStocked: { product_id: string; total: number }[];
    topPlants: { plant_id: string; total: number; record_count: number }[];
    monthlyTrend: { month: string; total: number; growthPct: number | null }[];
  }> {
    return this.inventoryReportsService.getInventoryRankings(topN ? Number(topN) : 10);
  }

  /**
   * Lấy cảnh báo tồn kho (thấp/cao bất thường)
   * GET /inventory-reports/alerts?lowThreshold=50&highThreshold=10000
   */
  @Get('/alerts')
  @HttpCode(HttpStatus.OK)
  getInventoryAlerts(
    @Query('lowThreshold') low?: string,
    @Query('highThreshold') high?: string,
  ): Promise<{
    lowStock: { product_id: string; plant_id: string; quantity: number; last_date: string }[];
    highStock: { product_id: string; plant_id: string; quantity: number; last_date: string }[];
    totalAlerts: number;
  }> {
    return this.inventoryReportsService.getInventoryAlerts(
      low ? Number(low) : 50,
      high ? Number(high) : 10000,
    );
  }

  /**
   * Lấy chi tiết báo cáo tồn kho theo ID
   * GET /inventory-reports/:id
   */
  @Get('/:id')
  getInventoryReportById(@Param('id') id: string): Promise<IInventoryReport> {
    return this.inventoryReportsService.getDetailInventoryReport(id);
  }

  /**
   * [ADMIN] Tạo báo cáo tồn kho mới
   * POST /inventory-reports
   */
  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createInventoryReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateInventoryReportDto,
  ): Promise<IInventoryReport> {
    return this.inventoryReportsService.createInventoryReport(dto, admin.username);
  }

  /**
   * [ADMIN] Cập nhật báo cáo tồn kho
   * PUT /inventory-reports/:id
   */
  @authGuard.Roles('ADMIN')
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  updateInventoryReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateInventoryReportDto,
    @Param('id') id: string,
  ): Promise<IInventoryReport> {
    return this.inventoryReportsService.updateInventoryReport(dto, id, admin.username);
  }

  /**
   * [ADMIN] Xóa báo cáo tồn kho
   * DELETE /inventory-reports/:id
   */
  @authGuard.Roles('ADMIN')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteInventoryReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.inventoryReportsService.deleteInventoryReport(id, admin.username);
  }
}
