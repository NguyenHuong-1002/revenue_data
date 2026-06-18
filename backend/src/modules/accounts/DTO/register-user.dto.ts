import { IsEmail, IsIn, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Họ tên không được để trống!' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự!' })
  fullname!: string;

  @IsNotEmpty({ message: 'Username không được để trống!' })
  @IsString({ message: 'Username phải là chuỗi ký tự!' })
  username!: string;

  @IsNotEmpty({ message: 'Password không được để trống!' })
  @IsString({ message: 'Password phải là chuỗi ký tự!' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự!' })
  password!: string;

  @IsNotEmpty({ message: 'Xác nhận password không được để trống!' })
  @IsString({ message: 'Xác nhận password phải là chuỗi ký tự!' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Xác nhận password phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!',
  })
  confirmPassword!: string;

  @IsNotEmpty({ message: 'Email không được để trống!' })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  mail!: string;
}
