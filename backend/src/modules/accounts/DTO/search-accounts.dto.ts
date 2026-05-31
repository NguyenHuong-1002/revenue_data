import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchAccountsDto {
  @ApiPropertyOptional({
    example: 'lan anh',
    description:
      'Từ khoá tìm kiếm — khớp một phần với fullname, username hoặc mail (không phân biệt hoa thường)',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    example: 'STAFF',
    enum: ['ADMIN', 'STAFF'],
    description: 'Lọc theo vai trò tài khoản',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ADMIN', 'STAFF'], { message: 'Role chỉ chấp nhận: ADMIN, STAFF' })
  role?: 'ADMIN' | 'STAFF';

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Số trang hiện tại (tối thiểu: 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Số bản ghi mỗi trang (tối đa: 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
