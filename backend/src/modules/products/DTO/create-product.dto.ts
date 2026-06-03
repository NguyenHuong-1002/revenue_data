import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Màu sắc (color) không được để trống!' })
  @IsString({ message: 'Màu sắc (color) phải là một chuỗi ký tự!' })
  color!: string;

  @IsNotEmpty({ message: 'Giá bán (listing_price) không được để trống!' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá bán (listing_price) phải là một số hợp lệ!' })
  @Min(0, { message: 'Giá bán (listing_price) phải lớn hơn hoặc bằng 0!' })
  listing_price!: number;

  @IsNotEmpty({ message: 'Giá vốn (price_cost) không được để trống!' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá vốn (price_cost) phải là một số hợp lệ!' })
  @Min(0, { message: 'Giá vốn (price_cost) phải lớn hơn hoặc bằng 0!' })
  price_cost!: number;

  @IsNotEmpty({ message: 'Giới tính (gender) không được để trống!' })
  @IsString({ message: 'Giới tính (gender) phải là một chuỗi ký tự!' })
  @IsIn(['Nam', 'Nu', 'Nữ', 'Unisex', 'Bé trai', 'Bé gái', 'MEN', 'WOM', 'BOY', 'GIR'], {
    message: 'Giới tính (gender) chỉ chấp nhận: Nam, Nữ, Bé trai, Bé gái, MEN, WOM, BOY, GIR!',
  })
  gender!: string;

  @IsNotEmpty({
    message: 'Chi tiết nhóm sản phẩm (detail_product_group) không được để trống!',
  })
  @IsString({
    message: 'Chi tiết nhóm sản phẩm (detail_product_group) phải là một chuỗi ký tự!',
  })
  detail_product_group!: string;

  @IsNotEmpty({ message: 'Kích cỡ (size) không được để trống!' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Kích cỡ (size) phải là một số hợp lệ!' })
  size!: number;

  @IsNotEmpty({ message: 'Nhóm độ tuổi (age_group) không được để trống!' })
  @IsString({ message: 'Nhóm độ tuổi (age_group) phải là một chuỗi ký tự!' })
  @IsIn(
    [
      '16 đến <24 tuổi',
      '24 đến <40 tuổi',
      '40 đến <60 tuổi',
      '0 đến <3 tuổi',
      'Trên 60 tuổi',
      '6 đến <10 tuổi',
      '3 đến <6 tuổi',
      '10 đến <16 tuổi',
      'Khác',
    ],
    {
      message: 'Nhóm độ tuổi (age_group) không hợp lệ!',
    },
  )
  age_group!: string;

  @IsNotEmpty({
    message: 'Nhóm hoạt động (activity_group) không được để trống!',
  })
  @IsString({
    message: 'Nhóm hoạt động (activity_group) phải là một chuỗi ký tự!',
  })
  @IsIn(['Thường nhật/Trường học', 'Thể thao', 'Văn phòng', 'Chuyên biệt', 'Khác'], {
    message: 'Nhóm hoạt động (activity_group) không hợp lệ!',
  })
  activity_group!: string;

  @IsNotEmpty({
    message: 'Nhóm phong cách sống (lifestyle_group) không được để trống!',
  })
  @IsString({
    message: 'Nhóm phong cách sống (lifestyle_group) phải là một chuỗi ký tự!',
  })
  @IsIn(['Sport', 'Casual', 'Fashion', 'Formal', 'Khác'], {
    message: 'Nhóm phong cách sống (lifestyle_group) không hợp lệ!',
  })
  lifestyle_group!: string;
}
