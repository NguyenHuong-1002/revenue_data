import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlantDto {
  @IsNotEmpty({ message: 'plant_id không được để trống!' })
  @IsString({ message: 'plant_id phải là chuỗi ký tự!' })
  plant_id!: string;

  @IsNotEmpty({ message: 'Tên nhà máy (name_plant) không được để trống!' })
  @IsString({ message: 'Tên nhà máy (name_plant) phải là chuỗi ký tự!' })
  name_plant!: string;

  @IsNotEmpty({ message: 'Địa chỉ (address) không được để trống!' })
  @IsString({ message: 'Địa chỉ (address) phải là chuỗi ký tự!' })
  address!: string;

  @IsNotEmpty({ message: 'Tên quản lý (manager_name) không được để trống!' })
  @IsString({ message: 'Tên quản lý (manager_name) phải là chuỗi ký tự!' })
  manager_name!: string;

  @IsNotEmpty({ message: 'Số điện thoại (phone) không được để trống!' })
  @IsString({ message: 'Số điện thoại (phone) phải là chuỗi ký tự!' })
  phone!: string;
}
