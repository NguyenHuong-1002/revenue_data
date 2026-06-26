import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class GetProductAllDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'Mã sản phẩm (product_id) phải là một chuỗi ký tự!' })
  product_id?: string;

  @IsOptional()
  @IsString({ message: 'Màu sắc (color) phải là một chuỗi ký tự!' })
  color?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Giá bán (listing_price) phải là một số hợp lệ!' })
  @Type(() => Number)
  listing_price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Giá vốn (price_cost) phải là một số hợp lệ!' })
  @Type(() => Number)
  price_cost?: number;

  @IsOptional()
  @IsString({ message: 'Giới tính (gender) phải là một chuỗi ký tự!' })
  gender?: string;

  @IsOptional()
  @IsString({
    message: 'Chi tiết nhóm sản phẩm (detail_product_group) phải là một chuỗi ký tự!',
  })
  detail_product_group?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Kích cỡ (size) phải là một số hợp lệ!' })
  size?: number;

  @IsOptional()
  @IsString({ message: 'Nhóm độ tuổi (age_group) phải là một chuỗi ký tự!' })
  age_group?: string;

  @IsOptional()
  @IsString({
    message: 'Nhóm hoạt động (activity_group) phải là một chuỗi ký tự!',
  })
  activity_group?: string;

  @IsOptional()
  @IsString({
    message: 'Nhóm phong cách sống (lifestyle_group) phải là một chuỗi ký tự!',
  })
  lifestyle_group?: string;
}
