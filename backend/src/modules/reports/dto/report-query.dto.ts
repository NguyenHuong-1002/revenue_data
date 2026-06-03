import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min, IsInt } from 'class-validator';

export class ReportQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc dữ liệu từ tháng nào, định dạng YYYY-MM',
    example: '2026-01',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  fromMonth?: string;

  @ApiPropertyOptional({
    description: 'Lọc dữ liệu đến tháng nào, định dạng YYYY-MM',
    example: '2026-06',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  toMonth?: string;

  @ApiPropertyOptional({
    description: 'Số dòng top sản phẩm/chi nhánh trong báo cáo doanh thu',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  topN = 10;
}
