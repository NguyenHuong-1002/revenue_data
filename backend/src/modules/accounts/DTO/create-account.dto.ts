import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'Fullname khong duoc de trong!' })
  @IsString({ message: 'Fullname phai la chuoi ky tu!' })
  fullname!: string;

  @IsNotEmpty({ message: 'Username khong duoc de trong!' })
  @IsString({ message: 'Username phai la chuoi ky tu!' })
  username!: string;

  @IsNotEmpty({ message: 'Password khong duoc de trong!' })
  @IsString({ message: 'Password phai la chuoi ky tu!' })
  @MinLength(6, { message: 'Password phai co it nhat 6 ky tu!' })
  password!: string;

  @IsNotEmpty({ message: 'Email khong duoc de trong!' })
  @IsEmail({}, { message: 'Email khong dung dinh dang!' })
  mail!: string;

  @IsOptional()
  @IsString({ message: 'AvatarURL phai la chuoi ky tu!' })
  avatarURL?: string;

  @IsOptional()
  @IsString({ message: 'Role phai la chuoi ky tu!' })
  @IsIn(['ADMIN', 'STAFF'], {
    message: 'Role chi chap nhan: ADMIN, STAFF!',
  })
  role?: 'ADMIN' | 'STAFF';
}
