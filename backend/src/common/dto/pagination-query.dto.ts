import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang (page) phải là số nguyên.' })
  @Min(1, { message: 'Số trang (page) tối thiểu phải là 1.' })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phần tử (limit) phải là số nguyên.' })
  @Min(1, { message: 'Số lượng phần tử (limit) tối thiểu phải là 1.' })
  @Max(100, { message: 'Số lượng phần tử (limit) tối đa không quá 100.' })
  limit = 10;
}
