import { Transform, Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ForecastQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  productId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  branchId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  plantId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  distributionChannel?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(24)
  horizon = 3;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  alpha = 0.3;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['month', 'week', 'quarter'])
  periodType: 'month' | 'week' | 'quarter' = 'month';

  @IsOptional()
  @IsIn(['all', 'sales', 'inventory'])
  scope: 'all' | 'sales' | 'inventory' = 'all';
}
