import { ApiProperty } from '@nestjs/swagger';

export class PlantItemDto {
  @ApiProperty({ example: '1201', description: 'Mã định danh nhà máy' })
  plant_id!: string;

  @ApiProperty({ example: 'Nhà máy 1201 - Hà Nội', description: 'Tên nhà máy' })
  name_plant!: string;

  @ApiProperty({ example: 'KCN trung tâm, Hà Nội', description: 'Địa chỉ' })
  address!: string;

  @ApiProperty({ example: 'Nguyễn Văn Hùng', description: 'Tên người quản lý' })
  manager_name!: string;

  @ApiProperty({ example: '0944328887', description: 'Số điện thoại' })
  phone!: string;

  @ApiProperty({ example: '2026-05-27T07:20:41.142Z', description: 'Thời gian tạo' })
  created_at!: Date;

  @ApiProperty({ example: '2026-05-27T07:20:41.142Z', description: 'Thời gian cập nhật' })
  updated_at!: Date;
}

export class PaginatedPlantsResponseDto {
  @ApiProperty({ type: [PlantItemDto], description: 'Danh sách nhà máy' })
  data!: PlantItemDto[];

  @ApiProperty({
    example: { page: 1, limit: 10, total: 31, totalPages: 4 },
    description: 'Siêu dữ liệu phân trang',
  })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
