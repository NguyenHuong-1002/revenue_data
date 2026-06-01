import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import {
  PaginatedAccountsResponseDto,
  AccountItemDto,
  LoginResponseDto,
  RegisterResponseDto,
} from './DTO/accounts-response.dto';
import { CreateAccountDto } from './DTO/create-account.dto';
import { LoginAccountDto } from './DTO/login-account.dto';
import { SearchAccountsDto } from './DTO/search-accounts.dto';

// ─────────────────────────────────────────────────────────────────────────────
// GET /accounts  —  Lấy danh sách tài khoản phân trang
// ─────────────────────────────────────────────────────────────────────────────
export function ApiGetUsersAllSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách tất cả tài khoản (có phân trang)',
      description:
        'Trả về danh sách tất cả tài khoản (Admin & Staff) trong hệ thống với hỗ trợ phân trang theo tham số `page` và `limit`. ' +
        'Kết quả được sắp xếp tăng dần theo `account_id`. API này được **công khai** (không yêu cầu đăng nhập).',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Số trang cần lấy (mặc định: 1, tối thiểu: 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Số bản ghi mỗi trang (mặc định: 10, tối đa: 100)',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách tài khoản thành công.',
      type: PaginatedAccountsResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Tham số truy vấn không hợp lệ (page hoặc limit sai kiểu / ngoài giới hạn).',
      schema: {
        example: {
          statusCode: 400,
          message: ['Số trang (page) tối thiểu phải là 1.'],
          error: 'Bad Request',
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /accounts/me  —  Lấy thông tin tài khoản đang đăng nhập
// ─────────────────────────────────────────────────────────────────────────────
export function ApiGetMeSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy thông tin cá nhân của tài khoản đang đăng nhập',
      description:
        'Trả về thông tin chi tiết đầy đủ của tài khoản dựa trên JWT Token. ' +
        '**Yêu cầu**: Bearer Token.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy thông tin tài khoản thành công.',
      type: AccountItemDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Chưa đăng nhập hoặc token không hợp lệ.',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /accounts/:id  —  Lấy chi tiết tài khoản theo ID
// ─────────────────────────────────────────────────────────────────────────────
export function ApiGetAccountByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy thông tin chi tiết tài khoản theo ID',
      description:
        'Trả về thông tin đầy đủ của một tài khoản cụ thể dựa trên mã định danh UUID. ' +
        'API này được **công khai** (không yêu cầu đăng nhập).',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Mã định danh duy nhất (UUID) của tài khoản cần lấy',
      example: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy thông tin chi tiết tài khoản thành công.',
      type: AccountItemDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy tài khoản với ID đã cung cấp.',
      schema: {
        example: {
          statusCode: 404,
          message: "Account with ID 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9' not found",
          error: 'Not Found',
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /accounts  —  Tạo tài khoản mới (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export function ApiCreateAccountSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo tài khoản mới (Chỉ ADMIN)',
      description:
        'Cho phép Admin tạo tài khoản mới với vai trò tuỳ chọn (ADMIN hoặc STAFF). ' +
        'Hệ thống tự động ghi nhận nhật ký thông báo hành động của Admin. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiBody({
      type: CreateAccountDto,
      description: 'Thông tin tài khoản cần tạo mới',
    }),
    ApiResponse({
      status: 201,
      description: 'Tạo tài khoản mới thành công.',
      type: AccountItemDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Dữ liệu đầu vào không hợp lệ (thiếu trường bắt buộc, sai định dạng,...).',
      schema: {
        example: {
          statusCode: 400,
          message: ['Fullname khong duoc de trong!', 'Email khong dung dinh dang!'],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Chưa đăng nhập hoặc Access Token không hợp lệ / hết hạn.',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Tài khoản không có quyền ADMIN để thực hiện thao tác này.',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Username hoặc Email đã tồn tại trong hệ thống.',
      schema: {
        example: {
          statusCode: 409,
          message: 'Username da ton tai',
          error: 'Conflict',
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /accounts/register  —  Đăng ký tài khoản mới (Public)
// ─────────────────────────────────────────────────────────────────────────────
export function ApiRegisterSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng ký tài khoản mới (Public)',
      description:
        'Cho phép người dùng tự đăng ký tài khoản mới. ' +
        'Tài khoản được tạo sẽ luôn có vai trò mặc định là **STAFF** (trường `role` trong body sẽ bị bỏ qua). ' +
        'API này **không yêu cầu** xác thực.',
    }),
    ApiBody({
      type: CreateAccountDto,
      description: 'Thông tin đăng ký tài khoản',
      examples: {
        example1: {
          summary: 'Đăng ký tài khoản Staff',
          value: {
            fullname: 'Nguyễn Văn An',
            username: 'vanan',
            password: 'Matkhau@123',
            mail: 'vanan@revenue.com',
            avatarURL: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Đăng ký tài khoản thành công (Không trả về nội dung).',
    }),
    ApiResponse({
      status: 400,
      description: 'Dữ liệu đầu vào không hợp lệ (thiếu trường bắt buộc, sai định dạng,...).',
      schema: {
        example: {
          statusCode: 400,
          message: ['Email khong dung dinh dang!', 'Password phai co it nhat 6 ky tu!'],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Username hoặc Email đã được đăng ký trước đó.',
      schema: {
        example: {
          statusCode: 409,
          message: 'Email da ton tai',
          error: 'Conflict',
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /accounts/login  —  Đăng nhập
// ─────────────────────────────────────────────────────────────────────────────
export function ApiLoginSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng nhập và lấy Access Token (JWT)',
      description:
        'Xác thực thông tin đăng nhập (username + password) và trả về JWT Access Token dạng Bearer. ' +
        'Token này cần được đính kèm vào header `Authorization: Bearer <token>` cho các request yêu cầu xác thực. ' +
        'API này **không yêu cầu** xác thực trước.',
    }),
    ApiBody({
      type: LoginAccountDto,
      description: 'Thông tin đăng nhập',
      examples: {
        example1: {
          summary: 'Đăng nhập tài khoản Admin',
          value: { username: 'admin', password: 'Admin@123' },
        },
        example2: {
          summary: 'Đăng nhập tài khoản Staff',
          value: { username: 'lananh', password: 'Matkhau@123' },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Đăng nhập thành công. Trả về JWT Access Token và thông tin tài khoản.',
      type: LoginResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Dữ liệu đầu vào không hợp lệ.',
      schema: {
        example: {
          statusCode: 400,
          message: ['Username khong duoc de trong!'],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Sai tên đăng nhập hoặc mật khẩu.',
      schema: {
        example: {
          statusCode: 401,
          message: 'Username hoac password khong dung',
          error: 'Unauthorized',
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /accounts/:id  —  Cập nhật thông tin tài khoản (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export function ApiUpdateAccountSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật thông tin tài khoản (Chỉ ADMIN)',
      description:
        'Cho phép Admin cập nhật một phần hoặc toàn bộ thông tin của tài khoản (Partial Update). ' +
        'Chỉ các trường được truyền vào body mới được cập nhật, các trường còn lại giữ nguyên giá trị cũ. ' +
        'Hệ thống tự động ghi nhận nhật ký thông báo hành động của Admin. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Mã định danh duy nhất (UUID) của tài khoản cần cập nhật',
      example: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
    }),
    ApiBody({
      type: CreateAccountDto,
      description: 'Các trường thông tin muốn cập nhật (tất cả đều tuỳ chọn - Partial Update)',
      examples: {
        example1: {
          summary: 'Đổi vai trò tài khoản lên ADMIN',
          value: { role: 'ADMIN' },
        },
        example2: {
          summary: 'Cập nhật thông tin cá nhân',
          value: {
            fullname: 'Nguyễn Thị Lan Anh (Đã cập nhật)',
            mail: 'lananh.new@revenue.com',
            avatarURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
          },
        },
        example3: {
          summary: 'Đổi mật khẩu',
          value: { password: 'MatkhauMoi@456' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật thông tin tài khoản thành công.',
      type: AccountItemDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Dữ liệu đầu vào không hợp lệ.',
      schema: {
        example: {
          statusCode: 400,
          message: ['Email khong dung dinh dang!'],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Chưa đăng nhập hoặc Access Token không hợp lệ / hết hạn.',
      schema: {
        example: { statusCode: 401, message: 'Unauthorized' },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Tài khoản không có quyền ADMIN để thực hiện thao tác này.',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy tài khoản với ID đã cung cấp.',
      schema: {
        example: {
          statusCode: 404,
          message: "Account with ID 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9' not found",
          error: 'Not Found',
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /accounts/:id  —  Xoá tài khoản (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export function ApiDeleteAccountSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xoá tài khoản khỏi hệ thống (Chỉ ADMIN)',
      description:
        'Xoá vĩnh viễn tài khoản khỏi cơ sở dữ liệu. Hành động này **không thể hoàn tác**. ' +
        'Hệ thống tự động ghi nhận nhật ký thông báo hành động của Admin. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Mã định danh duy nhất (UUID) của tài khoản cần xoá',
      example: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
    }),
    ApiResponse({
      status: 200,
      description: 'Xoá tài khoản thành công. Trả về `true` nếu bản ghi đã được xoá.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Chưa đăng nhập hoặc Access Token không hợp lệ / hết hạn.',
      schema: {
        example: { statusCode: 401, message: 'Unauthorized' },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Tài khoản không có quyền ADMIN để thực hiện thao tác này.',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy tài khoản với ID đã cung cấp.',
      schema: {
        example: {
          statusCode: 404,
          message: "Account with ID 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9' not found",
          error: 'Not Found',
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /accounts/:id/soft  —  Xoá mềm tài khoản (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export function ApiSoftDeleteAccountSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Vô hiệu hoá tài khoản - Soft Delete (Chỉ ADMIN)',
      description:
        'Ghi nhận thời điểm xoá vào cột `deleted_at` thay vì xoá hẳn khỏi Database. ' +
        'Tài khoản sau khi bị xoá mềm sẽ **không xuất hiện** trong các kết quả tìm kiếm và danh sách thông thường, ' +
        'nhưng vẫn có thể **khôi phục lại** bằng cách reset `deleted_at` về NULL. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Mã định danh duy nhất (UUID) của tài khoản cần xoá mềm',
      example: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
    }),
    ApiResponse({
      status: 204,
      description: 'Xoá mềm tài khoản thành công (Không trả về nội dung).',
    }),
    ApiResponse({
      status: 401,
      description: 'Chưa đăng nhập hoặc Access Token không hợp lệ / hết hạn.',
      schema: { example: { statusCode: 401, message: 'Unauthorized' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Tài khoản không có quyền ADMIN.',
      schema: {
        example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy tài khoản với ID đã cung cấp.',
      schema: {
        example: {
          statusCode: 404,
          message: "Account with ID 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9' not found",
          error: 'Not Found',
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /accounts/search  —  Tìm kiếm tài khoản
// ─────────────────────────────────────────────────────────────────────────────
export function ApiSearchAccountsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tìm kiếm tài khoản theo từ khoá (Chỉ ADMIN)',
      description:
        'Tìm kiếm tài khoản theo từ khoá `keyword` khớp một phần (LIKE) với `fullname`, `username` hoặc `mail`. ' +
        'Hỗ trợ lọc thêm theo `role` và phân trang. ' +
        'Các tài khoản đã bị xoá mềm sẽ tự động bị loại khỏi kết quả. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiQuery({
      name: 'keyword',
      required: false,
      type: String,
      example: 'tran ngoc anh',
      description:
        'Từ khoá tìm kiếm (khớp với fullname, username, mail — không phân biệt hoa thường)',
    }),
    ApiQuery({
      name: 'role',
      required: false,
      enum: ['ADMIN', 'STAFF'],
      description: 'Lọc theo vai trò tài khoản',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Số trang (mặc định: 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Số bản ghi mỗi trang (mặc định: 10, tối đa: 100)',
    }),
    ApiResponse({
      status: 200,
      description: 'Tìm kiếm thành công. Trả về danh sách tài khoản phân trang.',
      type: PaginatedAccountsResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Tham số truy vấn không hợp lệ.',
      schema: {
        example: {
          statusCode: 400,
          message: ['Role chỉ chấp nhận: ADMIN, STAFF'],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Chưa đăng nhập hoặc Access Token không hợp lệ / hết hạn.',
      schema: { example: { statusCode: 401, message: 'Unauthorized' } },
    }),
    ApiResponse({
      status: 403,
      description: 'Tài khoản không có quyền ADMIN.',
      schema: {
        example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' },
      },
    }),
  );
}
