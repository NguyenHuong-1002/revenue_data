import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAccountDto {
  @IsNotEmpty({ message: 'Username không được để trống!' })
  @IsString({ message: 'Username phải là chuỗi ký tự!' })
  username!: string;

  @IsNotEmpty({ message: 'Password không được để trống!' })
  @IsString({ message: 'Password phải là chuỗi ký tự!' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự!' })
  password!: string;
}
