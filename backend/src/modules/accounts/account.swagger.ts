import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  PaginatedAccountsResponseDto,
  AccountItemDto,
} from './DTO/accounts-response.dto';

export function ApiGetUsersAllSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách tất cả tài khoản phân trang',
      description:
        'API này trả về danh sách tất cả các tài khoản (bao gồm Admin và Staff) hiện có trên hệ thống có hỗ trợ phân trang dữ liệu theo số trang (page) và kích thước trang (limit).',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách tài khoản thành công.',
      type: PaginatedAccountsResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token truy cập không hợp lệ.',
    }),
  );
}

export function ApiGetAccountByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy thông tin tài khoản chi tiết theo mã ID (Admin)',
      description:
        'API này cho phép Admin lấy thông tin chi tiết của một tài khoản cụ thể trên hệ thống dựa vào mã định danh UUID của tài khoản đó.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Mã định danh duy nhất của tài khoản cần lấy (UUID)',
      example: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy thông tin chi tiết tài khoản thành công.',
      type: AccountItemDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token truy cập không hợp lệ.',
    }),
    ApiResponse({
      status: 403,
      description: 'Lỗi không đủ thẩm quyền (Không phải ADMIN).',
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy tài khoản có mã định danh ID đã cung cấp.',
    }),
  );
}
