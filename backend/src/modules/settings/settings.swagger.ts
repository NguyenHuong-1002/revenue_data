import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateSettingDto } from './DTO/update-setting.dto';

export function ApiGetAllSettingsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy tất cả cài đặt hệ thống',
      description:
        'Trả về danh sách tất cả cài đặt hệ thống được nhóm theo từng nhóm (group). ' +
        'Mỗi nhóm chứa một mảng các cài đặt với key, value, description, type và group. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách cài đặt thành công.',
      schema: {
        example: [
          {
            group: 'general',
            settings: [
              {
                key: 'SYSTEM_NAME',
                value: 'Hệ thống Quản lý Doanh thu',
                description: 'Tên hệ thống',
                type: 'string',
                group: 'general',
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-06-01T00:00:00.000Z',
              },
              {
                key: 'SYSTEM_LOGO',
                value: '/logo.png',
                description: 'URL logo hệ thống',
                type: 'string',
                group: 'general',
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-06-01T00:00:00.000Z',
              },
            ],
          },
          {
            group: 'notification',
            settings: [
              {
                key: 'NOTIFICATION_RETENTION_DAYS',
                value: '90',
                description: 'Số ngày lưu trữ thông báo',
                type: 'number',
                group: 'notification',
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-06-01T00:00:00.000Z',
              },
            ],
          },
        ],
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN.' }),
  );
}

export function ApiGetSettingByKeySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy cài đặt theo key',
      description:
        'Trả về chi tiết một cài đặt hệ thống dựa trên key. **Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiParam({
      name: 'key',
      type: 'string',
      example: 'SYSTEM_NAME',
      description: 'Key của cài đặt',
    }),
    ApiResponse({ status: 200, description: 'Lấy cài đặt thành công.' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy cài đặt với key đã cung cấp.' }),
  );
}

export function ApiUpdateSettingSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật hoặc tạo mới cài đặt (upsert)',
      description:
        'Cập nhật giá trị của một cài đặt hệ thống. Nếu key chưa tồn tại, hệ thống sẽ tự động tạo mới. ' +
        'Chỉ ADMIN mới có quyền thực hiện. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiParam({
      name: 'key',
      type: 'string',
      example: 'SYSTEM_NAME',
      description: 'Key của cài đặt cần cập nhật',
    }),
    ApiBody({
      type: UpdateSettingDto,
      description: 'Giá trị mới cho cài đặt',
      examples: {
        example1: {
          summary: 'Cập nhật tên hệ thống',
          value: {
            value: 'Hệ thống Quản lý Doanh thu v2',
            description: 'Tên hệ thống hiển thị trên trình duyệt',
          },
        },
        example2: {
          summary: 'Thay đổi số ngày lưu thông báo',
          value: { value: '180', type: 'number', group: 'notification' },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Cập nhật cài đặt thành công.' }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN.' }),
  );
}

export function ApiCreateSettingSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo mới cài đặt hệ thống',
      description:
        'Tạo một cài đặt mới với key, value, type, group và description. ' +
        'Key phải là duy nhất trong hệ thống. **Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['key', 'value'],
        properties: {
          key: {
            type: 'string',
            example: 'MAX_LOGIN_ATTEMPTS',
            description: 'Key duy nhất của cài đặt',
          },
          value: { type: 'string', example: '5', description: 'Giá trị của cài đặt' },
          type: {
            type: 'string',
            enum: ['string', 'number', 'boolean', 'json'],
            example: 'number',
            description: 'Kiểu dữ liệu',
          },
          group: { type: 'string', example: 'security', description: 'Nhóm cài đặt' },
          description: {
            type: 'string',
            example: 'Số lần đăng nhập sai tối đa trước khi khóa',
            description: 'Mô tả',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Tạo cài đặt thành công.' }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ hoặc key đã tồn tại.' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN.' }),
  );
}

export function ApiDeleteSettingSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xoá cài đặt hệ thống',
      description:
        'Xoá hoàn toàn một cài đặt khỏi hệ thống. Hành động này không thể hoàn tác. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiParam({
      name: 'key',
      type: 'string',
      example: 'MAX_LOGIN_ATTEMPTS',
      description: 'Key của cài đặt cần xoá',
    }),
    ApiResponse({ status: 200, description: 'Xoá cài đặt thành công.' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy cài đặt với key đã cung cấp.' }),
  );
}
