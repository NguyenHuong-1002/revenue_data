import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum InterpretationLanguage {
  VI = 'vi',
  EN = 'en',
}

export class InterpretationRequestDto {
  @ApiProperty({
    description: 'Tiêu đề báo cáo cần diễn giải',
    example: 'Phân tích biểu đồ Doanh thu tháng này',
  })
  @IsString()
  @Transform(({ value }) => String(value ?? '').trim())
  reportTitle!: string;

  @ApiPropertyOptional({
    description: 'Tổng doanh thu',
    example: 150000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalRevenue?: number;

  @ApiPropertyOptional({
    description: 'Phần trăm tăng/giảm doanh thu so với kỳ trước',
    example: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-1000)
  @Max(1000)
  revenueChangePercent?: number;

  @ApiPropertyOptional({
    description: 'Tên sản phẩm bán chạy nhất',
    example: 'Áo sơ mi nam',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  topProductName?: string;

  @ApiPropertyOptional({
    description: 'Mã sản phẩm bán chạy nhất',
    example: 'SANTD-01',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  topProductCode?: string;

  @ApiPropertyOptional({
    description: 'Số lượng bán ra của sản phẩm bán chạy nhất',
    example: 400,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  topProductSoldQuantity?: number;

  @ApiPropertyOptional({
    description: 'Tồn kho hiện tại của sản phẩm bán chạy nhất',
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiPropertyOptional({
    description: 'Trọng lượng trung bình mỗi chiếc (kg)',
    example: 0.3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  avgWeightPerPieceKg?: number;

  @ApiPropertyOptional({
    description: 'Ghi chú bổ sung do backend cung cấp',
    example: 'Nên đề xuất nhập hàng ngay trong 1-2 ngày tới.',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  additionalContext?: string;

  @ApiPropertyOptional({
    description: 'Ngôn ngữ phản hồi',
    example: InterpretationLanguage.VI,
    enum: InterpretationLanguage,
    default: InterpretationLanguage.VI,
  })
  @IsOptional()
  @IsEnum(InterpretationLanguage)
  language: InterpretationLanguage = InterpretationLanguage.VI;
}
