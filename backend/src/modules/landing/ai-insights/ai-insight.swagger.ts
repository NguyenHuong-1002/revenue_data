import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function ApiGetAiInsightsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách AI Insights trang chủ',
      description:
        'Trả về danh sách các AI Insights hiển thị trên landing page. API **công khai**.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách AI Insights thành công.',
      schema: {
        example: [
          {
            id: 1,
            icon: 'robot',
            title: 'Dự báo thông minh',
            description: 'AI dự đoán xu hướng',
            badge: 'AI',
            order: 1,
          },
        ],
      },
    }),
  );
}

export function ApiCreateAiInsightSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo AI Insight mới',
      description: 'Thêm một AI Insight vào landing page. API **công khai**.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          icon: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          badge: { type: 'string' },
          order: { type: 'number' },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Tạo AI Insight thành công.' }),
  );
}

export function ApiUpdateAiInsightSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật AI Insight',
      description: 'Cập nhật thông tin AI Insight theo ID. API **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của AI Insight' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          badge: { type: 'string' },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Cập nhật AI Insight thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy AI Insight.' }),
  );
}

export function ApiDeleteAiInsightSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xoá AI Insight',
      description: 'Xoá AI Insight khỏi landing page theo ID. API **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của AI Insight' }),
    ApiResponse({ status: 200, description: 'Xoá AI Insight thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy AI Insight.' }),
  );
}
