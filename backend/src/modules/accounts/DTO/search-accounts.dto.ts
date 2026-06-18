import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchAccountsDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ADMIN', 'STAFF'], { message: 'Role chỉ chấp nhận: ADMIN, STAFF' })
  role?: 'ADMIN' | 'STAFF';

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'INACTIVE', 'LOCKED'], {
    message: 'Trạng thái chỉ chấp nhận: ACTIVE, INACTIVE, LOCKED',
  })
  status_account?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
