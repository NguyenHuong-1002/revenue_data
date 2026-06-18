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
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import * as authGuard from 'src/middlewares/auth.guard';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportsService } from './reports.service';

@UseGuards(authGuard.AuthGuard)
@authGuard.Roles('ADMIN')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

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
