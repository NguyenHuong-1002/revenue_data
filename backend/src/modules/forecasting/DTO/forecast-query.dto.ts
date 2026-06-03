import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ForecastQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by product id',
    example: 'P001',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filter by branch id for sales forecast',
    example: 'BR001',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Filter by plant id for inventory forecast',
    example: 'PL001',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  plantId?: string;

  @ApiPropertyOptional({
    description: 'Filter by distribution channel for sales forecast',
    example: 'Online',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  distributionChannel?: string;

  @ApiPropertyOptional({
    description: 'Forecast horizon (so ky du bao)',
    example: 3,
    default: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(24)
  horizon = 3;

  @ApiPropertyOptional({
    description: 'EMA smoothing factor (he so lam muot)',
    example: 0.3,
    default: 0.3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  alpha = 0.3;

  @ApiPropertyOptional({
    description: 'Start date for historical data filter (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for historical data filter (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Period type for grouping (thang/tuan/quy)',
    example: 'month',
    enum: ['month', 'week', 'quarter'],
    default: 'month',
  })
  @IsOptional()
  @IsIn(['month', 'week', 'quarter'])
  periodType: 'month' | 'week' | 'quarter' = 'month';

  @ApiPropertyOptional({
    description: 'Choose source scope',
    example: 'all',
    enum: ['all', 'sales', 'inventory'],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['all', 'sales', 'inventory'])
  scope: 'all' | 'sales' | 'inventory' = 'all';
}
