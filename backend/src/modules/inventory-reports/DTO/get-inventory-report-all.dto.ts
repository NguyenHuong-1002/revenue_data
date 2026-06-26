import { Type } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class GetInventoryReportAllDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'Mã sản phẩm phải là chuỗi ký tự.' })
  product_id?: string;

  @IsOptional()
  @IsString({ message: 'Mã nhà máy phải là chuỗi ký tự.' })
  plant_id?: string;

  @IsOptional()
  @IsString({ message: 'Từ tháng phải là chuỗi ký tự (YYYY-MM).' })
  fromMonth?: string;

  @IsOptional()
  @IsString({ message: 'Đến tháng phải là chuỗi ký tự (YYYY-MM).' })
  toMonth?: string;
}
