import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsNotEmpty({ message: 'value không được để trống!' })
  @IsString({ message: 'value phải là chuỗi ký tự!' })
  value!: string;

  @IsOptional()
  @IsString({ message: 'description phải là chuỗi ký tự!' })
  description?: string;

  @IsOptional()
  @IsIn(['string', 'number', 'boolean', 'json'], {
    message: 'type chỉ chấp nhận: string, number, boolean, json!',
  })
  type?: 'string' | 'number' | 'boolean' | 'json';

  @IsOptional()
  @IsString({ message: 'group phải là chuỗi ký tự!' })
  group?: string;
}
