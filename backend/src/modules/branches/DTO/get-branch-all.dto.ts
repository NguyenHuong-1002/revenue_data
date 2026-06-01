import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetBranchAllDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang (page) phải là số nguyên.' })
  @Min(1, { message: 'Số trang (page) tối thiểu phải là 1.' })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng (limit) phải là số nguyên.' })
  @Min(1, { message: 'Số lượng (limit) tối thiểu phải là 1.' })
  @Max(100, { message: 'Số lượng (limit) tối đa không quá 100.' })
  limit = 10;

  @IsOptional()
  @IsString({ message: 'city phải là chuỗi ký tự!' })
  city?: string;
}
