import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class GetSaleReportAllDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'Mã sản phẩm phải là chuỗi ký tự.' })
  product_id?: string;

  @IsOptional()
  @IsString({ message: 'Mã chi nhánh phải là chuỗi ký tự.' })
  branch_id?: string;

  @IsOptional()
  @IsString({ message: 'Kênh phân phối phải là chuỗi ký tự.' })
  distribution_channel?: string;

  @IsOptional()
  @IsString({ message: 'Từ tháng phải là chuỗi ký tự (YYYY-MM).' })
  fromMonth?: string;

  @IsOptional()
  @IsString({ message: 'Đến tháng phải là chuỗi ký tự (YYYY-MM).' })
  toMonth?: string;
}
