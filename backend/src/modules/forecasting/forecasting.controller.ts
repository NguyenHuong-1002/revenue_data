// NestJS core: Controller, GET, query params, validation pipe
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as authGuard from 'src/middlewares/auth.guard';
import { ForecastQueryDto } from './DTO/forecast-query.dto';
import { IForecastCombinedResponse, IForecastDatasetResult } from './interfaces/forecast.interface';
// Service layer: business logic
import { ForecastingService } from './forecasting.service';
import {
  ApiGetCombinedForecastSwagger,
  ApiGetSalesForecastSwagger,
  ApiGetInventoryForecastSwagger,
} from './forecasting.swagger';

// ─── Controller Metadata ──────────────────────────────────────────────────────
@ApiTags('Du bao (Forecasting)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard)
@authGuard.Roles('ADMIN')
@Controller('forecast')
export class ForecastingController {
  constructor(private readonly forecastingService: ForecastingService) {}

  // ─── GET /forecast — kết hợp doanh số + tồn kho ──────────────────────────
  @ApiGetCombinedForecastSwagger()
  @Get()
  @HttpCode(HttpStatus.OK)
  getCombinedForecast(
    @Query(new ValidationPipe({ transform: true })) query: ForecastQueryDto,
  ): Promise<IForecastCombinedResponse> {
    return this.forecastingService.getCombinedForecast(query);
  }

  // ─── GET /forecast/sales — dự báo doanh số ──────────────────────────────
  @ApiGetSalesForecastSwagger()
  @Get('sales')
  @HttpCode(HttpStatus.OK)
  getSalesForecast(
    @Query(new ValidationPipe({ transform: true })) query: ForecastQueryDto,
  ): Promise<IForecastDatasetResult> {
    return this.forecastingService.getSalesForecast(query);
  }

  // ─── GET /forecast/inventory — dự báo tồn kho ───────────────────────────
  @ApiGetInventoryForecastSwagger()
  @Get('inventory')
  @HttpCode(HttpStatus.OK)
  getInventoryForecast(
    @Query(new ValidationPipe({ transform: true })) query: ForecastQueryDto,
  ): Promise<IForecastDatasetResult> {
    return this.forecastingService.getInventoryForecast(query);
  }
}
