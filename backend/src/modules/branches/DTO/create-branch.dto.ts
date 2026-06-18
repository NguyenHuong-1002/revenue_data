import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty({ message: 'Tên chi nhánh (name) không được để trống!' })
  @IsString({ message: 'Tên chi nhánh (name) phải là chuỗi ký tự!' })
  name!: string;

  @IsNotEmpty({ message: 'Thành phố (city) không được để trống!' })
  @IsString({ message: 'Thành phố (city) phải là chuỗi ký tự!' })
  city!: string;
}
