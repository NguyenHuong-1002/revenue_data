import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({
    example: 'Trần Ngọc Anh',
    description: 'Họ và tên đầy đủ của người dùng',
  })
  @IsNotEmpty({ message: 'Fullname khong duoc de trong!' })
  @IsString({ message: 'Fullname phai la chuoi ky tu!' })
  fullname!: string;

  @ApiProperty({
    example: 'tranngocanh',
    description: 'Tên tài khoản dùng để đăng nhập (không trùng lặp trong hệ thống)',
  })
  @IsNotEmpty({ message: 'Username khong duoc de trong!' })
  @IsString({ message: 'Username phai la chuoi ky tu!' })
  username!: string;

  @ApiProperty({
    example: 'Matkhau@123',
    description: 'Mật khẩu đăng nhập (tối thiểu 6 ký tự)',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password khong duoc de trong!' })
  @IsString({ message: 'Password phai la chuoi ky tu!' })
  @MinLength(6, { message: 'Password phai co it nhat 6 ky tu!' })
  password!: string;

  @ApiProperty({
    example: 'tranngocanh@revenue.com',
    description: 'Địa chỉ email (không trùng lặp trong hệ thống)',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email khong duoc de trong!' })
  @IsEmail({}, { message: 'Email khong dung dinh dang!' })
  mail!: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    description: 'Đường dẫn URL ảnh đại diện (tuỳ chọn)',
  })
  @IsOptional()
  @IsString({ message: 'AvatarURL phai la chuoi ky tu!' })
  avatarURL?: string;

  @ApiPropertyOptional({
    example: 'STAFF',
    enum: ['ADMIN', 'STAFF'],
    default: 'STAFF',
    description: 'Vai trò phân quyền của tài khoản (mặc định: STAFF)',
  })
  @IsOptional()
  @IsString({ message: 'Role phai la chuoi ky tu!' })
  @IsIn(['ADMIN', 'STAFF'], {
    message: 'Role chi chap nhan: ADMIN, STAFF!',
  })
  role?: 'ADMIN' | 'STAFF';
}
