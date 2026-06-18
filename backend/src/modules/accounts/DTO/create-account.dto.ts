import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'Fullname không được để trống!' })
  @IsString({ message: 'Fullname phải là chuỗi ký tự!' })
  fullname!: string;

  @IsNotEmpty({ message: 'Username không được để trống!' })
  @IsString({ message: 'Username phải là chuỗi ký tự!' })
  username!: string;

  @IsNotEmpty({ message: 'Password không được để trống!' })
  @IsString({ message: 'Password phải là chuỗi ký tự!' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự!' })
  password!: string;

  @IsNotEmpty({ message: 'Email không được để trống!' })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  mail!: string;

  @IsOptional()
  @IsString({ message: 'AvatarURL phải là chuỗi ký tự!' })
  avatarURL?: string;

  @IsOptional()
  @IsString({ message: 'Role phải là chuỗi ký tự!' })
  @IsIn(['ADMIN', 'STAFF'], {
    message: 'Role chỉ chấp nhận: ADMIN, STAFF!',
  })
  role?: 'ADMIN' | 'STAFF';

  @IsOptional()
  @IsString({ message: 'Status_account phải là chuỗi ký tự!' })
  @IsIn(['ACTIVE', 'INACTIVE', 'LOCKED'], {
    message: 'Status_account chỉ chấp nhận: ACTIVE, INACTIVE, LOCKED!',
  })
  status_account?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
}
