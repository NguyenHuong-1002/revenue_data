import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'MatchPassword', async: false })
class MatchPasswordValidator implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments): boolean {
    const [passwordField] = args.constraints as string[];
    const object = args.object as Record<string, unknown>;

    return confirmPassword === object[passwordField];
  }
}

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
  @Validate(MatchPasswordValidator, ['password'], {
    message: 'Xác nhận password không khớp với password!',
  })
  confirmPassword!: string;

  @IsNotEmpty({ message: 'Email không được để trống!' })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  mail!: string;

  @IsIn(['STAFF'], { message: 'Role chỉ chấp nhận: STAFF!' })
  role = 'STAFF' as const;

  @IsIn(['ACTIVE'], { message: 'Trạng thái chỉ chấp nhận: ACTIVE!' })
  status_account = 'ACTIVE' as const;
}
