import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Query,
  Res,
  StreamableFile,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import * as authGuard from 'src/guards/auth.guard';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportsService } from './reports.service';

/**
 * Controller xuất báo cáo (PDF, Excel)
 * Routes: /reports
 */
@authGuard.Roles('ADMIN')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * [ADMIN] Xuất báo cáo tăng trưởng PDF
   * GET /reports/growth/pdf?startDate=xxx&endDate=xxx
   */
  @Get('growth/pdf')
  @HttpCode(HttpStatus.OK)
  async exportGrowthPdf(
    @Query(new ValidationPipe({ transform: true })) query: ReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.reportsService.exportGrowthPdf(query);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="growth-report.pdf"',
    });
    return new StreamableFile(buffer);
  }

  /**
   * [ADMIN] Xuất báo cáo tăng trưởng Excel
   * GET /reports/growth/excel?startDate=xxx&endDate=xxx
   */
  @Get('growth/excel')
  @HttpCode(HttpStatus.OK)
  async exportGrowthExcel(
    @Query(new ValidationPipe({ transform: true })) query: ReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.reportsService.exportGrowthExcel(query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="growth-report.xlsx"',
    });
    return new StreamableFile(buffer);
  }

  /**
   * [ADMIN] Xuất báo cáo doanh thu PDF
   * GET /reports/revenue/pdf?startDate=xxx&endDate=xxx
   */
  @Get('revenue/pdf')
  @HttpCode(HttpStatus.OK)
  async exportRevenuePdf(
    @Query(new ValidationPipe({ transform: true })) query: ReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.reportsService.exportRevenuePdf(query);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="revenue-report.pdf"',
    });
    return new StreamableFile(buffer);
  }

  /**
   * [ADMIN] Xuất báo cáo doanh thu Excel
   * GET /reports/revenue/excel?startDate=xxx&endDate=xxx
   */
  @Get('revenue/excel')
  @HttpCode(HttpStatus.OK)
  async exportRevenueExcel(
    @Query(new ValidationPipe({ transform: true })) query: ReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.reportsService.exportRevenueExcel(query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="revenue-report.xlsx"',
    });
    return new StreamableFile(buffer);
  }
}
