import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginatedPlantsResponseDto, PlantItemDto } from './DTO/plant-response.dto';

export function ApiGetPlantsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách tất cả nhà máy phân trang',
      description:
        'API này trả về danh sách tất cả các nhà máy sản xuất hiện có trên hệ thống. Hỗ trợ lọc theo địa chỉ (`address`) hoặc tên quản lý (`manager_name`), kèm phân trang qua tham số `page` và `limit`. Dữ liệu trả về bao gồm mảng các nhà máy kèm thông tin phân trang (tổng số bản ghi, tổng số trang).',
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
      name: 'address',
      type: 'string',
      required: false,
      example: 'KCN trung tâm',
      description: 'Lọc nhà máy theo địa chỉ (tìm kiếm không phân biệt hoa thường, khớp một phần)',
    }),
    ApiQuery({
      name: 'manager_name',
      type: 'string',
      required: false,
      example: 'Nguyễn Văn Hùng',
      description:
        'Lọc nhà máy theo tên người quản lý (tìm kiếm không phân biệt hoa thường, khớp một phần)',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách nhà máy thành công. Trả về mảng dữ liệu kèm metadata phân trang.',
      type: PaginatedPlantsResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
  );
}

export function ApiGetPlantByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy thông tin nhà máy theo ID',
      description:
        'API này trả về thông tin chi tiết của một nhà máy sản xuất dựa trên mã `plant_id` được cung cấp. Dữ liệu bao gồm tên nhà máy, địa chỉ, tên quản lý, số điện thoại và thời gian tạo/cập nhật.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Mã định danh duy nhất của nhà máy (plant_id)',
      example: '1201',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy thông tin nhà máy thành công.',
      type: PlantItemDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Lỗi chưa đăng nhập hoặc token không hợp lệ.',
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy nhà máy với mã ID đã cung cấp.',
    }),
  );
}

export function ApiCreatePlantSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo nhà máy mới (Admin)',
      description:
        'API này cho phép Admin tạo mới một nhà máy sản xuất trong hệ thống. Yêu cầu cung cấp `plant_id` (mã nhà máy duy nhất), `name_plant` (tên nhà máy), `address` (địa chỉ), `manager_name` (tên quản lý) và `phone` (số điện thoại). Hệ thống sẽ tự động tạo thông báo đến tất cả tài khoản active sau khi tạo thành công.',
    }),
    ApiResponse({
      status: 201,
      description: 'Tạo nhà máy thành công. Trả về thông tin nhà máy vừa được tạo.',
      type: PlantItemDto,
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

export function ApiUpdatePlantSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật thông tin nhà máy theo ID (Admin)',
      description:
        'API này cho phép Admin cập nhật thông tin của một nhà máy hiện có. Các trường có thể cập nhật bao gồm `name_plant` (tên nhà máy), `address` (địa chỉ), `manager_name` (tên quản lý) và `phone` (số điện thoại). Không thể thay đổi `plant_id`. Hệ thống sẽ tự động tạo thông báo sau khi cập nhật thành công.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Mã định danh của nhà máy cần cập nhật (plant_id)',
      example: '1201',
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật nhà máy thành công. Trả về thông tin nhà máy sau khi cập nhật.',
      type: PlantItemDto,
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
      description: 'Không tìm thấy nhà máy cần cập nhật.',
    }),
  );
}

export function ApiDeletePlantSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xóa nhà máy theo ID (Admin)',
      description:
        'API này cho phép Admin xóa hoàn toàn một nhà máy ra khỏi hệ thống. Lưu ý: thao tác này là xóa cứng (hard delete) không thể khôi phục. Hệ thống sẽ tự động tạo thông báo sau khi xóa thành công.',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Mã định danh của nhà máy cần xóa (plant_id)',
      example: '1201',
    }),
    ApiResponse({
      status: 200,
      description: 'Xóa nhà máy thành công (trả về true).',
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
      description: 'Không tìm thấy nhà máy cần xóa.',
    }),
  );
}
