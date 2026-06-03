import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

// ─── Features ──────────────────────────────────────────────────────────────────

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

// ─── AI Insights ───────────────────────────────────────────────────────────────

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

// ─── Testimonials ──────────────────────────────────────────────────────────────

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

// ─── Pricing ───────────────────────────────────────────────────────────────────

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
