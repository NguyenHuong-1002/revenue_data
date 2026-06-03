import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

// ─── Sessions ─────────────────────────────────────────────────────────────────

export function ApiGetSessionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách tất cả phiên hội thoại',
      description:
        'Trả về danh sách tất cả các phiên hội thoại chat, sắp xếp theo thứ tự: ' +
        'phiên được ghim (pinned) lên đầu, sau đó theo thời gian truy cập gần nhất giảm dần. ' +
        'API này **công khai**, không yêu cầu xác thực.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách phiên hội thoại thành công.',
      schema: {
        example: [
          {
            id: 1,
            title: 'Phân tích doanh thu tháng 5',
            description: 'Hội thoại về phân tích số liệu',
            isPinned: true,
            createdAt: '2026-06-01T00:00:00.000Z',
            updatedAt: '2026-06-03T00:00:00.000Z',
            lastAccessedAt: '2026-06-03T12:00:00.000Z',
          },
        ],
      },
    }),
  );
}

export function ApiCreateSessionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo phiên hội thoại mới',
      description:
        'Tạo một phiên chat mới. Nếu không truyền `title`, tự động đặt là "Cuộc hội thoại mới". ' +
        'API này **công khai**.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: 'Phân tích doanh thu',
            description: 'Tiêu đề phiên (tuỳ chọn)',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Tạo phiên hội thoại thành công.',
      schema: {
        example: {
          id: 2,
          title: 'Phân tích doanh thu',
          isPinned: false,
          createdAt: '2026-06-03T00:00:00.000Z',
          updatedAt: '2026-06-03T00:00:00.000Z',
          lastAccessedAt: '2026-06-03T00:00:00.000Z',
        },
      },
    }),
  );
}

export function ApiUpdateSessionTitleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật tiêu đề phiên hội thoại',
      description: 'Cập nhật tiêu đề mới cho phiên chat dựa trên ID. API này **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của phiên hội thoại' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: { title: { type: 'string', example: 'Phân tích mới' } },
      },
    }),
    ApiResponse({ status: 200, description: 'Cập nhật tiêu đề thành công.' }),
    ApiResponse({ status: 400, description: 'Title không được để trống.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy phiên hội thoại.' }),
  );
}

export function ApiUpdateSessionDescriptionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cập nhật mô tả phiên hội thoại',
      description: 'Cập nhật mô tả cho phiên chat. API này **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của phiên hội thoại' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: { description: { type: 'string', example: 'Nội dung phân tích chi tiết' } },
      },
    }),
    ApiResponse({ status: 200, description: 'Cập nhật mô tả thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy phiên hội thoại.' }),
  );
}

export function ApiTogglePinSessionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Ghim/Bỏ ghim phiên hội thoại',
      description: 'Chuyển đổi trạng thái ghim (pin) của một phiên chat. API này **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của phiên hội thoại' }),
    ApiResponse({ status: 200, description: 'Đã chuyển đổi trạng thái ghim thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy phiên hội thoại.' }),
  );
}

export function ApiDeleteAllSessionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xoá tất cả phiên hội thoại',
      description:
        'Xoá hoàn toàn tất cả các phiên chat và tin nhắn liên quan khỏi hệ thống. API này **công khai**.',
    }),
    ApiResponse({
      status: 200,
      description: 'Đã xoá tất cả phiên hội thoại.',
      schema: { example: { deleted: 5 } },
    }),
  );
}

export function ApiDeleteSessionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xoá phiên hội thoại theo ID',
      description:
        'Xoá hoàn toàn một phiên chat và tất cả tin nhắn trong phiên đó. API này **công khai**.',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      example: 1,
      description: 'ID của phiên hội thoại cần xoá',
    }),
    ApiResponse({ status: 200, description: 'Xoá phiên thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy phiên hội thoại.' }),
  );
}

// ─── Messages ──────────────────────────────────────────────────────────────────

export function ApiGetMessagesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy tin nhắn của phiên hội thoại',
      description:
        'Trả về danh sách tin nhắn theo thứ tự tăng dần (cũ nhất đến mới nhất) của một phiên chat. API này **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của phiên hội thoại' }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách tin nhắn thành công.',
      schema: {
        example: [
          {
            id: 1,
            sessionId: 1,
            role: 'user',
            content: 'Phân tích doanh thu tháng 5',
            createdAt: '2026-06-01T00:00:00.000Z',
          },
          {
            id: 2,
            sessionId: 1,
            role: 'assistant',
            content: 'Dựa trên dữ liệu hiện có...',
            createdAt: '2026-06-01T00:00:00.000Z',
          },
        ],
      },
    }),
    ApiResponse({ status: 404, description: 'Không tìm thấy phiên hội thoại.' }),
  );
}

export function ApiClearMessagesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xoá tất cả tin nhắn trong phiên',
      description: 'Xoá toàn bộ tin nhắn của một phiên chat. API này **công khai**.',
    }),
    ApiParam({ name: 'id', type: 'number', example: 1, description: 'ID của phiên hội thoại' }),
    ApiResponse({ status: 200, description: 'Đã xoá toàn bộ tin nhắn.' }),
  );
}

// ─── AI Completion ─────────────────────────────────────────────────────────────

export function ApiGetChatCompletionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Gửi tin nhắn đến AI Chat (DeepSeek)',
      description:
        'Gửi danh sách tin nhắn đến mô hình AI (DeepSeech/OpenRouter) để nhận phản hồi. ' +
        'Hỗ trợ lưu trữ tin nhắn vào phiên hội thoại nếu truyền `sessionId`. ' +
        'Tự động thêm system instruction nếu chưa có. ' +
        'API này **công khai**.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['messages'],
        properties: {
          messages: {
            type: 'array',
            description: 'Danh sách tin nhắn',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['system', 'user', 'assistant'], example: 'user' },
                content: { type: 'string', example: 'Phân tích doanh thu tháng 5 cho tôi' },
              },
            },
          },
          sessionId: {
            type: 'number',
            example: 1,
            description: 'ID phiên hội thoại (tuỳ chọn, để lưu tin nhắn)',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'AI phản hồi thành công.',
      schema: { example: { role: 'assistant', content: 'Dựa trên dữ liệu doanh thu tháng 5...' } },
    }),
    ApiResponse({ status: 400, description: 'Messages không hợp lệ (phải là mảng không rỗng).' }),
    ApiResponse({ status: 500, description: 'Lỗi kết nối AI API hoặc thiếu API Key.' }),
  );
}
