import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function ApiGetPricingSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách gói giá',
      description:
        'Trả về danh sách các gói giá/dịch vụ hiển thị trên landing page. API **công khai**.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách gói giá thành công.',
      schema: {
        example: [
          {
            id: 1,
            name: 'Gói Cơ bản',
            price: '1.000.000đ',
            features: ['Tính năng A', 'Tính năng B'],
            highlighted: false,
            order: 1,
          },
        ],
      },
    }),
  );
}

export function ApiCreatePricingSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo gói giá mới',
      description: 'Thêm một gói giá mới vào landing page. API **công khai**.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } },
          highlighted: { type: 'boolean' },
          order: { type: 'number' },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Tạo gói giá thành công.' }),
  );
}

export function ApiUpdatePricingSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật gói giá',
      description: 'Cập nhật thông tin gói giá theo ID. API **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của gói giá' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } },
          highlighted: { type: 'boolean' },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Cập nhật gói giá thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy gói giá.' }),
  );
}

export function ApiDeletePricingSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xoá gói giá',
      description: 'Xoá gói giá khỏi landing page theo ID. API **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của gói giá' }),
    ApiResponse({ status: 200, description: 'Xoá gói giá thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy gói giá.' }),
  );
}
