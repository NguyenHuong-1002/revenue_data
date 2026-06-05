import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function ApiGetFeaturesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách tính năng trang chủ',
      description:
        'Trả về danh sách các tính năng nổi bật hiển thị trên landing page. API này **công khai**, không yêu cầu xác thực.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách tính năng thành công.',
      schema: {
        example: [
          {
            id: 1,
            icon: 'chart-line',
            title: 'Phân tích doanh thu',
            description: 'Theo dõi doanh thu theo thời gian thực',
            order: 1,
          },
        ],
      },
    }),
  );
}

export function ApiCreateFeatureSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo tính năng trang chủ mới',
      description: 'Thêm một tính năng mới vào landing page. API này **công khai**.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          icon: { type: 'string', example: 'chart-line' },
          title: { type: 'string', example: 'Báo cáo thông minh' },
          description: { type: 'string', example: 'Tự động tạo báo cáo' },
          order: { type: 'number', example: 2 },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Tạo tính năng thành công.' }),
  );
}

export function ApiUpdateFeatureSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật tính năng trang chủ',
      description: 'Cập nhật thông tin một tính năng theo ID. API này **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của tính năng' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          order: { type: 'number' },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Cập nhật tính năng thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy tính năng.' }),
  );
}

export function ApiDeleteFeatureSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xoá tính năng trang chủ',
      description: 'Xoá một tính năng khỏi landing page theo ID. API này **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của tính năng' }),
    ApiResponse({ status: 200, description: 'Xoá tính năng thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy tính năng.' }),
  );
}
