import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class GetSaleReportAllDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số skip phải là số nguyên.' })
  @Min(0, { message: 'Số skip tối thiểu phải là 0.' })
  skip = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phần tử (limit) phải là số nguyên.' })
  @Min(1, { message: 'Số lượng phần tử (limit) tối thiểu phải là 1.' })
  @Max(100, { message: 'Số lượng phần tử (limit) tối đa không quá 100.' })
  limit = 10;

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
