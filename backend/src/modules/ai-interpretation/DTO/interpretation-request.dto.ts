import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum InterpretationLanguage {
  VI = 'vi',
  EN = 'en',
}

export class InterpretationRequestDto {
  @IsString()
  @Transform(({ value }) => String(value ?? '').trim())
  reportTitle!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalRevenue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-1000)
  @Max(1000)
  revenueChangePercent?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  topProductName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  topProductCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  topProductSoldQuantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  avgWeightPerPieceKg?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  additionalContext?: string;

  @IsOptional()
  @IsEnum(InterpretationLanguage)
  language: InterpretationLanguage = InterpretationLanguage.VI;
}
