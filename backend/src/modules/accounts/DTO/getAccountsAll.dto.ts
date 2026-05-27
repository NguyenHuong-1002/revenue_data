import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAccountsAllDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Số trang hiện tại cần lấy',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang (page) phải là một số nguyên.' })
  @Min(1, { message: 'Số trang (page) tối thiểu phải là 1.' })
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Số lượng bản ghi trên mỗi trang (Tối đa: 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng (limit) phải là một số nguyên.' })
  @Min(1, { message: 'Số lượng (limit) tối thiểu phải là 1.' })
  @Max(100, { message: 'Số lượng (limit) tối đa không được vượt quá 100.' })
  limit: number = 10;
}
