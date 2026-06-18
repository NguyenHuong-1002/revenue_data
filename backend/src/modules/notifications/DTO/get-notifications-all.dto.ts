import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNotificationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang (page) phải là một số nguyên.' })
  @Min(1, { message: 'Số trang (page) tối thiểu phải là 1.' })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng (limit) phải là một số nguyên.' })
  @Min(1, { message: 'Số lượng (limit) tối thiểu phải là 1.' })
  @Max(100, { message: 'Số lượng (limit) tối đa không được vượt quá 100.' })
  limit = 20;
}
