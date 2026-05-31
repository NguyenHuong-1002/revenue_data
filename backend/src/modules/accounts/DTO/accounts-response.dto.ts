import { ApiProperty } from '@nestjs/swagger';

export class AccountItemDto {
  @ApiProperty({
    example: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
    description: 'Mã định danh duy nhất của tài khoản (UUID)',
  })
  account_id!: string;

  @ApiProperty({
    example: 'STAFF',
    enum: ['ADMIN', 'STAFF'],
    description: 'Vai trò phân quyền trong hệ thống',
  })
  role!: 'ADMIN' | 'STAFF';

  @ApiProperty({
    example: 'Nguyễn Thị Lan Anh',
    description: 'Họ và tên đầy đủ của người dùng',
  })
  fullname!: string;

  @ApiProperty({
    example: 'lananh',
    description: 'Tên tài khoản dùng để đăng nhập',
  })
  username!: string;

  @ApiProperty({
    example: 'lananh@revenue.com',
    description: 'Địa chỉ thư điện tử Email',
  })
  mail!: string;

  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    description: 'Đường dẫn ảnh đại diện của tài khoản',
    nullable: true,
  })
  avatarURL!: string | null;

  @ApiProperty({
    example: '2026-05-27T07:20:41.267Z',
    description: 'Thời gian khởi tạo tài khoản',
  })
  created_at!: Date;

  @ApiProperty({
    example: '2026-05-27T07:20:41.267Z',
    description: 'Thời gian cập nhật tài khoản gần nhất',
  })
  updated_at!: Date;
}

export class PaginatedAccountsResponseDto {
  @ApiProperty({
    type: [AccountItemDto],
    description: 'Danh sách các tài khoản được trả về tương ứng trang hiện tại',
  })
  data!: AccountItemDto[];

  @ApiProperty({
    example: {
      page: 1,
      limit: 10,
      total: 45,
      totalPages: 5,
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

export class LoginResponseDto {
  @ApiProperty({
    example: 'Success',
    description: 'Thông báo kết quả đăng nhập',
  })
  message!: string;

  @ApiProperty({
    type: AccountItemDto,
    description: 'Thông tin cơ bản của tài khoản đã xác thực (đã lược bỏ mật khẩu)',
  })
  account!: AccountItemDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZTlmYmE5Ml...',
    description: 'Chuỗi JWT Access Token dùng để xác thực các request tiếp theo',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Loại token xác thực (luôn là Bearer)',
  })
  tokenType!: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    example: true,
    description: 'Trạng thái đăng ký thành công hay thất bại',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Đăng ký tài khoản thành công',
    description: 'Thông báo kết quả đăng ký',
  })
  message!: string;
}
