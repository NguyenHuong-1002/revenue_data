import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty({ message: 'store_id không được để trống!' })
  @IsString({ message: 'store_id phải là chuỗi ký tự!' })
  store_id!: string;

  @IsNotEmpty({ message: 'Tên chi nhánh (name) không được để trống!' })
  @IsString({ message: 'Tên chi nhánh (name) phải là chuỗi ký tự!' })
  name!: string;

  @IsNotEmpty({ message: 'Thành phố (city) không được để trống!' })
  @IsString({ message: 'Thành phố (city) phải là chuỗi ký tự!' })
  city!: string;
}
