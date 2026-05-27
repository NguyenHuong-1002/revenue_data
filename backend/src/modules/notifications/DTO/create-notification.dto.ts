import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsOptional()
  @IsString({ message: 'account_id phải là chuỗi ký tự!' })
  account_id?: string | null;

  @IsNotEmpty({ message: 'title không được để trống!' })
  @IsString({ message: 'title phải là chuỗi ký tự!' })
  title!: string;

  @IsNotEmpty({ message: 'content không được để trống!' })
  @IsString({ message: 'content phải là chuỗi ký tự!' })
  content!: string;

  @IsOptional()
  @IsEnum(['SYSTEM', 'INVENTORY_ALERT', 'NEW_SALE', 'CUSTOMER_NEW', 'OTHER'], {
    message: 'type chỉ chấp nhận: SYSTEM, INVENTORY_ALERT, NEW_SALE, CUSTOMER_NEW, OTHER!',
  })
  type?: 'SYSTEM' | 'INVENTORY_ALERT' | 'NEW_SALE' | 'CUSTOMER_NEW' | 'OTHER';
}
