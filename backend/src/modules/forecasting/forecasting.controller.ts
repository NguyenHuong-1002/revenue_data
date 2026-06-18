import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import * as authGuard from 'src/middlewares/auth.guard';
import { ForecastQueryDto } from './dto/forecast-query.dto';
import { IForecastCombinedResponse, IForecastDatasetResult } from './interfaces/forecast.interface';
import { ForecastingService } from './forecasting.service';

@UseGuards(authGuard.AuthGuard)
@authGuard.Roles('ADMIN')
@Controller('forecast')
export class ForecastingController {
  constructor(private readonly forecastingService: ForecastingService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getCombinedForecast(
    @Query(new ValidationPipe({ transform: true })) query: ForecastQueryDto,
  ): Promise<IForecastCombinedResponse> {
    return this.forecastingService.getCombinedForecast(query);
  }

  @Get('sales')
  @HttpCode(HttpStatus.OK)
  getSalesForecast(
    @Query(new ValidationPipe({ transform: true })) query: ForecastQueryDto,
  ): Promise<IForecastDatasetResult> {
    return this.forecastingService.getSalesForecast(query);
  }

  @Get('inventory')
  @HttpCode(HttpStatus.OK)
  getInventoryForecast(
    @Query(new ValidationPipe({ transform: true })) query: ForecastQueryDto,
  ): Promise<IForecastDatasetResult> {
    return this.forecastingService.getInventoryForecast(query);
  }
}
