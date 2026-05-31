import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PaginatedProductsResponseDto, ProductItemDto } from './DTO/product-response.dto';

export function ApiGetProductsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách tất cả sản phẩm phân trang',
      description:
        'API này trả về danh sách tất cả các sản phẩm hiện có trên hệ thống với bộ lọc linh hoạt và hỗ trợ phân trang.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách sản phẩm thành công.',
      type: PaginatedProductsResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
  );
}

export function ApiPostProductSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo sản phẩm mới (Admin)',
      description: 'API này cho phép Admin tạo mới một sản phẩm trong hệ thống.',
    }),
    ApiResponse({
      status: 201,
      description: 'Tạo sản phẩm thành công.',
      type: ProductItemDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
    ApiResponse({
      status: 403,
      description: 'Lỗi không đủ thẩm quyền (Không phải ADMIN).',
    }),
  );
}

export function ApiGetDetailProductSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy thông tin chi tiết một sản phẩm theo ID',
      description: 'API này trả về chi tiết của một sản phẩm dựa trên ID sản phẩm được cung cấp.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Mã định danh duy nhất của sản phẩm',
      example: 'SP1716800000000',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy thông tin chi tiết sản phẩm thành công.',
      type: ProductItemDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy sản phẩm với ID đã cung cấp.',
    }),
  );
}

export function ApiUpdateProductSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật thông tin sản phẩm theo ID (Admin)',
      description: 'API này cho phép Admin cập nhật thông tin chi tiết của một sản phẩm hiện có.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Mã định danh của sản phẩm cần cập nhật',
      example: 'SP1716800000000',
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật sản phẩm thành công.',
      type: ProductItemDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
    ApiResponse({
      status: 403,
      description: 'Lỗi không đủ thẩm quyền.',
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy sản phẩm cần cập nhật.',
    }),
  );
}

export function ApiDeleteProductSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xóa sản phẩm theo ID (Admin)',
      description: 'API này cho phép Admin xóa hoàn toàn một sản phẩm ra khỏi hệ thống.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Mã định danh của sản phẩm cần xóa',
      example: 'SP1716800000000',
    }),
    ApiResponse({
      status: 200,
      description: 'Xóa sản phẩm thành công (trả về true).',
      type: Boolean,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
    ApiResponse({
      status: 403,
      description: 'Lỗi không đủ thẩm quyền.',
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy sản phẩm cần xóa.',
    }),
  );
}
