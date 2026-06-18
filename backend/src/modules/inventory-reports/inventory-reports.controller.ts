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
import * as authGuard from '@/middlewares/auth.guard';
import { InventoryReportsService } from './inventory-reports.service';
import { CreateInventoryReportDto } from './DTO/create-inventory-report.dto';
import { GetInventoryReportAllDto } from './DTO/get-inventory-report-all.dto';
import {
  IInventoryReport,
  IPaginatedInventoryReports,
} from './interfaces/inventory-report.interface';

@UseGuards(authGuard.AuthGuard)
@Controller('inventory-reports')
export class InventoryReportsController {
  constructor(private readonly inventoryReportsService: InventoryReportsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getInventoryReports(
    @Query(new ValidationPipe({ transform: true })) query: GetInventoryReportAllDto,
  ): Promise<IPaginatedInventoryReports> {
    return this.inventoryReportsService.getInventoryReportsAll(query);
  }

  @Get('/stats')
  @HttpCode(HttpStatus.OK)
  getInventoryReportStats(): Promise<any> {
    return this.inventoryReportsService.getInventoryReportStats();
  }

  @Get('/kpis')
  @HttpCode(HttpStatus.OK)
  getInventoryKpis(): Promise<any> {
    return this.inventoryReportsService.getInventoryKpis();
  }

  @Get('/rankings')
  @HttpCode(HttpStatus.OK)
  getInventoryRankings(@Query('topN') topN?: string): Promise<any> {
    return this.inventoryReportsService.getInventoryRankings(topN ? Number(topN) : 10);
  }

  @Get('/alerts')
  @HttpCode(HttpStatus.OK)
  getInventoryAlerts(
    @Query('lowThreshold') low?: string,
    @Query('highThreshold') high?: string,
  ): Promise<any> {
    return this.inventoryReportsService.getInventoryAlerts(
      low ? Number(low) : 50,
      high ? Number(high) : 10000,
    );
  }

  @Get('/:id')
  getDetailInventoryReport(@Param('id') id: string): Promise<IInventoryReport> {
    return this.inventoryReportsService.getDetailInventoryReport(id);
  }

  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createInventoryReport(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateInventoryReportDto,
  ): Promise<IInventoryReport> {
    return this.inventoryReportsService.createInventoryReport(dto, admin.username);
  }

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
