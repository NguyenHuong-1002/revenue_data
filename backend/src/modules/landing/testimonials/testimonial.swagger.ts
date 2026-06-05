import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function ApiGetTestimonialsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách đánh giá khách hàng',
      description:
        'Trả về danh sách các đánh giá (testimonial) hiển thị trên landing page. API **công khai**.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách đánh giá thành công.',
      schema: {
        example: [
          {
            id: 1,
            avatar: '/avatars/user1.jpg',
            name: 'Nguyễn Văn An',
            role: 'Giám đốc kinh doanh',
            content: 'Hệ thống giúp tôi tiết kiệm...',
            rating: 5,
            order: 1,
          },
        ],
      },
    }),
  );
}

export function ApiCreateTestimonialSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo đánh giá khách hàng mới',
      description: 'Thêm một đánh giá khách hàng vào landing page. API **công khai**.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          avatar: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string' },
          content: { type: 'string' },
          rating: { type: 'number' },
          order: { type: 'number' },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Tạo đánh giá thành công.' }),
  );
}

export function ApiUpdateTestimonialSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật đánh giá khách hàng',
      description: 'Cập nhật thông tin đánh giá theo ID. API **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của đánh giá' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: { content: { type: 'string' }, rating: { type: 'number' } },
      },
    }),
    ApiResponse({ status: 200, description: 'Cập nhật đánh giá thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy đánh giá.' }),
  );
}

export function ApiDeleteTestimonialSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xoá đánh giá khách hàng',
      description: 'Xoá đánh giá khỏi landing page theo ID. API **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của đánh giá' }),
    ApiResponse({ status: 200, description: 'Xoá đánh giá thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy đánh giá.' }),
  );
}
