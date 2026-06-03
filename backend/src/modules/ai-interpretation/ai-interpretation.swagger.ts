import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InterpretationRequestDto } from './DTO/interpretation-request.dto';

export function ApiInterpretSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Gửi chỉ số kinh doanh đến AI (DeepSeek) để phân tích',
      description:
        'API này gửi các chỉ số kinh doanh có cấu trúc (doanh thu, sản phẩm bán chạy, tồn kho,...) đến mô hình AI DeepSeek ' +
        'thông qua OpenRouter hoặc API trực tiếp. AI sẽ trả về bản phân tích ngắn gọn (tóm tắt 3 gạch đầu dòng + khuyến nghị) ' +
        'bằng tiếng Việt hoặc tiếng Anh tuỳ theo tham số `language`. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiBody({
      type: InterpretationRequestDto,
      description: 'Các chỉ số kinh doanh cần AI phân tích',
      examples: {
        example1: {
          summary: 'Phân tích doanh thu tháng',
          value: {
            reportTitle: 'Phân tích biểu đồ Doanh thu tháng 5/2026',
            totalRevenue: 150000000,
            revenueChangePercent: 12,
            topProductName: 'Áo sơ mi nam',
            topProductCode: 'SANTD-01',
            topProductSoldQuantity: 400,
            currentStock: 50,
            avgWeightPerPieceKg: 0.3,
            additionalContext: 'Nên đề xuất nhập hàng ngay trong 1-2 ngày tới.',
            language: 'vi',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'AI phân tích thành công.',
      schema: {
        example: {
          provider: 'deepseek',
          model: 'deepseek/deepseek-chat',
          content: {
            summaryBullets: [
              'Doanh thu tháng này đạt 150.000.000 VNĐ, tăng 12% so với kỳ trước — tín hiệu tích cực.',
              'Sản phẩm "Áo sơ mi nam" (SANTD-01) dẫn đầu với 400 chiếc bán ra, chiếm tỷ trọng lớn.',
              'Tồn kho chỉ còn 50 chiếc (trọng lượng ~15kg), nguy cơ hết hàng trong 1-2 ngày tới.',
            ],
            recommendation:
              'Cần nhập thêm Áo sơ mi nam ngay trong 1-2 ngày tới để tránh gián đoạn doanh thu. Đề xuất tăng đơn hàng nhập gấp 3 lần so với tồn kho hiện tại.',
          },
          rawContent: '{"summaryBullets":["..."],"recommendation":"..."}',
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (thiếu reportTitle).' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN.' }),
    ApiResponse({ status: 500, description: 'Lỗi kết nối đến AI API hoặc thiếu API Key.' }),
  );
}
