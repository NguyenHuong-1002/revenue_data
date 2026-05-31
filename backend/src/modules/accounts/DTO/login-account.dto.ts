import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAccountDto {
  @ApiProperty({
    example: 'lananh',
    description: 'Tên tài khoản dùng để đăng nhập',
  })
  @IsNotEmpty({ message: 'Username khong duoc de trong!' })
  @IsString({ message: 'Username phai la chuoi ky tu!' })
  username!: string;

  @ApiProperty({
    example: 'Matkhau@123',
    description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password khong duoc de trong!' })
  @IsString({ message: 'Password phai la chuoi ky tu!' })
  @MinLength(6, { message: 'Password phai co it nhat 6 ky tu!' })
  password!: string;
}
