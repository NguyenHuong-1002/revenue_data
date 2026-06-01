import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginatedBranchesResponseDto, BranchItemDto } from './DTO/branch-response.dto';

export function ApiGetBranchesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách tất cả chi nhánh phân trang',
      description:
        'API này trả về danh sách tất cả các chi nhánh (cửa hàng) hiện có trên hệ thống. Hỗ trợ lọc theo thành phố (`city`) và phân trang qua tham số `page` và `limit`. Dữ liệu trả về bao gồm mảng các chi nhánh kèm thông tin phân trang (tổng số bản ghi, tổng số trang).',
    }),
    ApiQuery({
      name: 'page',
      type: 'number',
      required: false,
      example: 1,
      description: 'Số trang hiện tại cần lấy (mặc định: 1)',
    }),
    ApiQuery({
      name: 'limit',
      type: 'number',
      required: false,
      example: 10,
      description: 'Số lượng bản ghi trên mỗi trang (mặc định: 10, tối đa: 100)',
    }),
    ApiQuery({
      name: 'city',
      type: 'string',
      required: false,
      example: 'Hà Nội',
      description: 'Lọc chi nhánh theo thành phố (tìm kiếm không phân biệt hoa thường, khớp một phần)',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách chi nhánh thành công. Trả về mảng dữ liệu kèm metadata phân trang.',
      type: PaginatedBranchesResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
  );
}

export function ApiGetBranchByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy thông tin chi nhánh theo ID',
      description:
        'API này trả về thông tin chi tiết của một chi nhánh dựa trên mã `store_id` được cung cấp. Dữ liệu bao gồm tên chi nhánh, thành phố và thời gian tạo/cập nhật.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Mã định danh duy nhất của chi nhánh (store_id)',
      example: '1100',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy thông tin chi nhánh thành công.',
      type: BranchItemDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy chi nhánh với mã ID đã cung cấp.',
    }),
  );
}

export function ApiCreateBranchSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo chi nhánh mới (Admin)',
      description:
        'API này cho phép Admin tạo mới một chi nhánh (cửa hàng) trong hệ thống. Yêu cầu cung cấp `store_id` (mã chi nhánh duy nhất), `name` (tên chi nhánh) và `city` (thành phố). Hệ thống sẽ tự động tạo thông báo đến tất cả tài khoản active sau khi tạo thành công.',
    }),
    ApiResponse({
      status: 201,
      description: 'Tạo chi nhánh thành công. Trả về thông tin chi nhánh vừa được tạo.',
      type: BranchItemDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Dữ liệu đầu vào không hợp lệ (thiếu trường bắt buộc, sai định dạng).',
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
    ApiResponse({
      status: 403,
      description: 'Lỗi không đủ thẩm quyền (yêu cầu quyền ADMIN).',
    }),
  );
}

export function ApiUpdateBranchSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật thông tin chi nhánh theo ID (Admin)',
      description:
        'API này cho phép Admin cập nhật thông tin của một chi nhánh hiện có. Các trường có thể cập nhật bao gồm `name` (tên chi nhánh) và `city` (thành phố). Không thể thay đổi `store_id`. Hệ thống sẽ tự động tạo thông báo sau khi cập nhật thành công.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Mã định danh của chi nhánh cần cập nhật (store_id)',
      example: '1100',
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật chi nhánh thành công. Trả về thông tin chi nhánh sau khi cập nhật.',
      type: BranchItemDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Dữ liệu đầu vào không hợp lệ.',
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
    ApiResponse({
      status: 403,
      description: 'Lỗi không đủ thẩm quyền (yêu cầu quyền ADMIN).',
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy chi nhánh cần cập nhật.',
    }),
  );
}

export function ApiDeleteBranchSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xóa chi nhánh theo ID (Admin)',
      description:
        'API này cho phép Admin xóa hoàn toàn một chi nhánh ra khỏi hệ thống. Lưu ý: thao tác này là xóa cứng (hard delete) không thể khôi phục. Hệ thống sẽ tự động tạo thông báo sau khi xóa thành công.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Mã định danh của chi nhánh cần xóa (store_id)',
      example: '1100',
    }),
    ApiResponse({
      status: 200,
      description: 'Xóa chi nhánh thành công (trả về true).',
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
    ApiResponse({
      status: 403,
      description: 'Lỗi không đủ thẩm quyền (yêu cầu quyền ADMIN).',
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy chi nhánh cần xóa.',
    }),
  );
}
