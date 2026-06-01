import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import * as authGuard from 'src/middlewares/auth.guard';
import { ForecastQueryDto } from './DTO/forecast-query.dto';
import {
  IForecastCombinedResponse,
  IForecastDatasetResult,
} from './interfaces/forecast.interface';
import { ForecastingService } from './forecasting.service';

@ApiTags('Du bao (Forecasting)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard)
@authGuard.Roles('ADMIN')
@Controller('forecast')
export class ForecastingController {
  constructor(private readonly forecastingService: ForecastingService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get combined sales and inventory forecasts',
  })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'plantId', required: false })
  @ApiQuery({ name: 'distributionChannel', required: false })
  @ApiQuery({ name: 'horizon', required: false, example: 3 })
  @ApiQuery({ name: 'alpha', required: false, example: 0.3 })
  getCombinedForecast(
    @Query(new ValidationPipe({ transform: true })) query: ForecastQueryDto,
  ): Promise<IForecastCombinedResponse> {
    return this.forecastingService.getCombinedForecast(query);
  }

  @Get('sales')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get sales forecast based on saleReport',
  })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'distributionChannel', required: false })
  @ApiQuery({ name: 'horizon', required: false, example: 3 })
  @ApiQuery({ name: 'alpha', required: false, example: 0.3 })
  getSalesForecast(
    @Query(new ValidationPipe({ transform: true })) query: ForecastQueryDto,
  ): Promise<IForecastDatasetResult> {
    return this.forecastingService.getSalesForecast(query);
  }

  @Get('inventory')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get inventory forecast based on InventoryReport',
  })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'plantId', required: false })
  @ApiQuery({ name: 'horizon', required: false, example: 3 })
  @ApiQuery({ name: 'alpha', required: false, example: 0.3 })
  getInventoryForecast(
    @Query(new ValidationPipe({ transform: true })) query: ForecastQueryDto,
  ): Promise<IForecastDatasetResult> {
    return this.forecastingService.getInventoryForecast(query);
  }
}

