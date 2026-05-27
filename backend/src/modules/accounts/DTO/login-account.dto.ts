import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAccountDto {
  @IsNotEmpty({ message: 'Username khong duoc de trong!' })
  @IsString({ message: 'Username phai la chuoi ky tu!' })
  username!: string;

  @IsNotEmpty({ message: 'Password khong duoc de trong!' })
  @IsString({ message: 'Password phai la chuoi ky tu!' })
  @MinLength(6, { message: 'Password phai co it nhat 6 ky tu!' })
  password!: string;
}
