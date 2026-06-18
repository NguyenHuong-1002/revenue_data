import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min, IsInt } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  fromMonth?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  toMonth?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  topN = 10;
}
