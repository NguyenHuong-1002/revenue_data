import { ApiProperty } from '@nestjs/swagger';

export class BranchItemDto {
  @ApiProperty({ example: '1100', description: 'Mã định danh chi nhánh' })
  store_id!: string;

  @ApiProperty({ example: 'Chi Nhánh Đống Đa - Royal City', description: 'Tên chi nhánh' })
  name!: string;

  @ApiProperty({ example: 'Hà Nội', description: 'Thành phố' })
  city!: string;

  @ApiProperty({ example: '72 Nguyễn Trãi, Đống Đa, Hà Nội', description: 'Địa chỉ chi tiết', nullable: true })
  address!: string | null;

  @ApiProperty({ example: 21.0029, description: 'Vĩ độ (latitude)', nullable: true })
  latitude!: number | null;

  @ApiProperty({ example: 105.8152, description: 'Kinh độ (longitude)', nullable: true })
  longitude!: number | null;

  @ApiProperty({ example: '2026-05-27T07:20:41.142Z', description: 'Thời gian tạo' })
  created_at!: Date;

  @ApiProperty({ example: '2026-05-27T07:20:41.142Z', description: 'Thời gian cập nhật' })
  updated_at!: Date;
}

export class PaginatedBranchesResponseDto {
  @ApiProperty({ type: [BranchItemDto], description: 'Danh sách chi nhánh' })
  data!: BranchItemDto[];

  @ApiProperty({
    example: { page: 1, limit: 10, total: 8, totalPages: 1 },
    description: 'Siêu dữ liệu phân trang',
  })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
