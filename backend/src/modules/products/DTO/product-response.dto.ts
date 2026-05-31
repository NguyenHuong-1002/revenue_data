import { ApiProperty } from '@nestjs/swagger';

export class ProductItemDto {
  @ApiProperty({ example: 'SP1716800000000', description: 'Mã định danh duy nhất của sản phẩm' })
  product_id!: string;

  @ApiProperty({ example: 'Đen', description: 'Màu sắc sản phẩm' })
  color!: string;

  @ApiProperty({ example: 450000, description: 'Giá bán niêm yết của sản phẩm' })
  listing_price!: number;

  @ApiProperty({ example: 250000, description: 'Giá vốn đầu vào của sản phẩm' })
  price_cost!: number;

  @ApiProperty({
    example: 'MEN',
    enum: ['MEN', 'WOM', 'BOY', 'GIR'],
    description: 'Đối tượng giới tính phù hợp',
  })
  gender!: 'MEN' | 'WOM' | 'BOY' | 'GIR';

  @ApiProperty({
    example: 'SANTD',
    enum: ['SANTD', 'DEPTD', 'GTTPC', 'GTTCD', 'SANTR', 'GIATR', 'PKIEN', 'TBLTH', 'TBLTR'],
    description: 'Nhóm chi tiết của sản phẩm',
  })
  detail_product_group!: string;

  @ApiProperty({ example: 42, description: 'Kích cỡ (size) sản phẩm' })
  size!: number;

  @ApiProperty({
    example: '24 đến <40 tuổi',
    enum: [
      '16 đến <24 tuổi',
      '24 đến <40 tuổi',
      '40 đến <60 tuổi',
      '0 đến <3 tuổi',
      'Trên 60 tuổi',
      '6 đến <10 tuổi',
      '3 đến <6 tuổi',
      '10 đến <16 tuổi',
      'Khác',
    ],
    description: 'Nhóm độ tuổi phù hợp',
  })
  age_group!: string;

  @ApiProperty({
    example: 'Thể thao',
    enum: ['Thường nhật/Trường học', 'Thể thao', 'Văn phòng', 'Chuyên biệt', 'Khác'],
    description: 'Nhóm hoạt động phù hợp',
  })
  activity_group!: string;

  @ApiProperty({
    example: 'Sport',
    enum: ['Sport', 'Casual', 'Fashion', 'Formal', 'Khác'],
    description: 'Nhóm phong cách sống',
  })
  lifestyle_group!: string;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({
    type: [ProductItemDto],
    description: 'Danh sách sản phẩm tương ứng trang hiện tại',
  })
  data!: ProductItemDto[];

  @ApiProperty({
    example: {
      page: 1,
      limit: 10,
      total: 120,
      totalPages: 12,
    },
    description: 'Siêu dữ liệu phân trang (Metadata)',
  })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
