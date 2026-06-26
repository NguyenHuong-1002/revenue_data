import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class GetBranchAllDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'city phải là chuỗi ký tự!' })
  city?: string;
}
