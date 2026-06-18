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
import * as authGuard from 'src/middlewares/auth.guard';
import { SaleReportsService } from './sale-reports.service';
import { CreateSaleReportDto } from './DTO/create-sale-report.dto';
import { GetSaleReportAllDto } from './DTO/get-sale-report-all.dto';
import { ISaleReport, IPaginatedSaleReports } from './interfaces/sale-report.interface';

@UseGuards(authGuard.AuthGuard)
@Controller('sale-reports')
export class SaleReportsController {
  constructor(private readonly saleReportsService: SaleReportsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getSaleReports(
    @Query(new ValidationPipe({ transform: true })) query: GetSaleReportAllDto,
  ): Promise<IPaginatedSaleReports> {
    return this.saleReportsService.getSaleReportsAll(query);
  }

  @Get('/stats')
  @HttpCode(HttpStatus.OK)
  getSaleReportStats(@Query('range') range?: string): Promise<any> {
    return this.saleReportsService.getSaleReportStats(range);
  }

  @Get('/revenue-stats')
  @HttpCode(HttpStatus.OK)
  getRevenueDashboardStats(@Query('range') range?: string): Promise<any> {
    return this.saleReportsService.getRevenueDashboardStats(range);
  }

  @Get('/highlight-products-stats')
  @HttpCode(HttpStatus.OK)
  getHighlightProductsStats(@Query('range') range?: string): Promise<any> {
    return this.saleReportsService.getHighlightProductsStats(range);
  }

  @Get('/:id')
  getDetailSaleReport(@Param('id') id: string): Promise<ISaleReport> {
    return this.saleReportsService.getDetailSaleReport(id);
  }

  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSaleReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateSaleReportDto,
  ): Promise<ISaleReport> {
    return this.saleReportsService.createSaleReport(dto, admin.username);
  }

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
