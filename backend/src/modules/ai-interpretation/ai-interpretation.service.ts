// NestJS core: DI (Injectable), exception classes, logger
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InterpretationRequestDto, InterpretationLanguage } from './DTO/interpretation-request.dto';
import {
  IInterpretationResponse,
  IInterpretationSummary,
} from './interfaces/interpretation.interface';

// ─── Type Aliases ─────────────────────────────────────────────────────────────
// Kiểu dữ liệu cho một message trong chat completion API của DeepSeek
type DeepSeekChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Kiểu dữ liệu cho response từ DeepSeek Chat Completion API
type DeepSeekChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

@Injectable()
// ─── Service: logic nghiệp vụ cho AI Interpretation ─────────────────────────
export class AiInterpretationService {
  // Logger riêng cho service, prefix là tên class
  private readonly logger = new Logger(AiInterpretationService.name);

  // ─── Public method: entry point ──────────────────────────────────────────
  async interpret(dto: InterpretationRequestDto): Promise<IInterpretationResponse> {
    this.validateInput(dto);

    // Đọc key từ env — tự động chọn OpenRouter (hoặc biến cũ API_OPEN_ROUTR) hoặc DeepSeek
    const apiKey =
      process.env.OPENROUTER_API_KEY || process.env.API_OPEN_ROUTR || process.env.DEEPSEEK_API_KEY;
    const isOpenRouter = !!(process.env.OPENROUTER_API_KEY || process.env.API_OPEN_ROUTR);

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Missing API Key in environment (OPENROUTER_API_KEY, API_OPEN_ROUTR or DEEPSEEK_API_KEY)',
      );
    }

    const baseUrl = isOpenRouter
      ? 'https://openrouter.ai/api/v1'
      : process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

    const model = isOpenRouter
      ? process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'
      : process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    // Xây dựng prompt (system + user messages)
    const messages = this.buildMessages(dto);

    // Chuẩn bị headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    if (isOpenRouter) {
      headers['HTTP-Referer'] = 'https://revenue-ai.vn';
      headers['X-Title'] = 'Revenue AI Dashboard';
    }

    // Gọi API (REST, không stream)
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        stream: false, // không dùng streaming
        temperature: 0.2, // độ sáng tạo thấp → ưu tiên xác suất cao
      }),
    });

    // Xử lý lỗi HTTP từ API
    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`AI API error ${response.status}: ${errorText}`);
      throw new InternalServerErrorException('AI API request failed');
    }

    // Parse JSON response và lấy nội dung text từ choice đầu tiên
    const data = (await response.json()) as DeepSeekChatCompletionResponse;
    const rawContent = data.choices?.[0]?.message?.content?.trim() ?? '';

    if (!rawContent) {
      throw new InternalServerErrorException('DeepSeek returned empty content');
    }

    // Parse JSON string từ assistant reply thành object có cấu trúc
    const content = this.parseAssistantContent(rawContent);

    return {
      provider: 'deepseek',
      model,
      content, // đã parse: { summaryBullets, recommendation }
      rawContent, // giữ lại bản gốc để debug
    };
  }

  // ─── Validation cơ bản ──────────────────────────────────────────────────
  private validateInput(dto: InterpretationRequestDto): void {
    if (!dto.reportTitle || !dto.reportTitle.trim()) {
      throw new BadRequestException('reportTitle is required');
    }
  }

  // ─── Xây dựng messages gửi lên DeepSeek ──────────────────────────────────
  private buildMessages(dto: InterpretationRequestDto): DeepSeekChatMessage[] {
    const facts = this.buildFacts(dto);
    // Chọn ngôn ngữ theo yêu cầu từ client
    const languageInstruction =
      dto.language === InterpretationLanguage.EN ? 'Reply in English.' : 'Trả lời bằng tiếng Việt.';

    return [
      {
        // System prompt: định hướng vai trò & format output
        role: 'system',
        content: [
          'Bạn là chuyên gia phân tích dữ liệu bán lẻ và tư vấn chiến lược kinh doanh.',
          'QUY TẮC BẮT BUỘC:',
          '1. Chỉ sử dụng đúng các số liệu thực tế được cung cấp trong tin nhắn của user (đây là các số liệu kết xuất từ cơ sở dữ liệu hệ thống). Tuyệt đối KHÔNG tự tạo số liệu giả, KHÔNG sử dụng tri thức hay dữ liệu bên ngoài hệ thống.',
          '2. Không tự ý suy luận vượt quá dữ kiện thực tế được cung cấp. Nếu dữ liệu thiếu hoặc không đủ để đưa ra phân tích chính xác, hãy ghi rõ là chưa đủ dữ liệu thay vì tự bịa số liệu.',
          '3. Hãy trả về CHÍNH XÁC định dạng JSON hợp lệ, không bọc trong khối markdown ```json, không giải thích thêm ngoài JSON.',
          'Schema bắt buộc:',
          '{',
          '  "summaryBullets": ["... các phân tích bám sát dữ liệu (tối đa 3 gạch đầu dòng) ..."],',
          '  "recommendation": "... lời khuyên chiến lược kinh doanh thực tế bám sát dữ liệu thực tế cung cấp ..."',
          '}',
        ].join('\n'),
      },
      {
        // User message: chứa dữ liệu thực tế cần phân tích
        role: 'user',
        content: [
          dto.reportTitle.trim(),
          facts,
          dto.additionalContext ? `Ghi chú bổ sung: ${dto.additionalContext}` : '',
          languageInstruction,
        ]
          .filter(Boolean) // loại bỏ phần tử rỗng
          .join('\n\n'),
      },
    ];
  }

  // ─── Xây chuỗi fact từ DTO ──────────────────────────────────────────────
  private buildFacts(dto: InterpretationRequestDto): string {
    const lines: string[] = [];

    // 1. Tổng doanh thu
    if (dto.totalRevenue !== undefined) {
      lines.push(`Tổng doanh thu: ${dto.totalRevenue.toLocaleString('vi-VN')} VNĐ`);
    }

    // 2. % thay đổi doanh thu so với kỳ trước
    if (dto.revenueChangePercent !== undefined) {
      const sign =
        dto.revenueChangePercent > 0 ? 'Tăng' : dto.revenueChangePercent < 0 ? 'Giảm' : 'Không đổi';
      lines.push(`${sign} ${Math.abs(dto.revenueChangePercent)}% so với kỳ trước`);
    }

    // 3. Sản phẩm bán chạy nhất (top 1)
    if (dto.topProductName || dto.topProductCode || dto.topProductSoldQuantity !== undefined) {
      const parts: string[] = [];
      if (dto.topProductName) parts.push(dto.topProductName);
      if (dto.topProductCode) parts.push(`Mã SP: ${dto.topProductCode}`);
      if (dto.topProductSoldQuantity !== undefined) {
        parts.push(`Bán được ${dto.topProductSoldQuantity.toLocaleString('vi-VN')} chiếc`);
      }
      lines.push(`Top 1 bán chạy: ${parts.join(' - ')}`);
    }

    // 4. Tồn kho & trọng lượng (cảnh báo)
    if (dto.currentStock !== undefined || dto.avgWeightPerPieceKg !== undefined) {
      const parts: string[] = [];
      if (dto.currentStock !== undefined) {
        parts.push(`Tồn kho hiện tại: ${dto.currentStock.toLocaleString('vi-VN')} chiếc`);
      }
      if (dto.avgWeightPerPieceKg !== undefined) {
        parts.push(`Trọng lượng trung bình ${dto.avgWeightPerPieceKg}kg/chiếc`);
      }
      lines.push(`Cảnh báo: ${parts.join('. ')}`);
    }

    return lines.join('\n');
  }

  // ─── Parse JSON từ assistant reply ──────────────────────────────────────
  // DeepSeek trả về text, ta cần trích xuất JSON object từ text đó
  private parseAssistantContent(rawContent: string): IInterpretationSummary {
    const jsonText = this.extractJsonObject(rawContent);
    // Nếu không tìm thấy JSON → fallback: dùng rawContent làm bullet duy nhất
    if (!jsonText) {
      return {
        summaryBullets: [rawContent],
        recommendation: '',
      };
    }

    try {
      const parsed = JSON.parse(jsonText) as Partial<IInterpretationSummary>;
      // summaryBullets: tối đa 3 item, trim, loại bỏ rỗng
      const summaryBullets = Array.isArray(parsed.summaryBullets)
        ? parsed.summaryBullets
            .map((item) => String(item).trim())
            .filter(Boolean)
            .slice(0, 3)
        : [];
      const recommendation =
        typeof parsed.recommendation === 'string' ? parsed.recommendation.trim() : '';

      return {
        summaryBullets,
        recommendation,
      };
    } catch {
      // JSON parse lỗi → fallback an toàn
      return {
        summaryBullets: [rawContent],
        recommendation: '',
      };
    }
  }

  // ─── Trích xuất JSON object từ 1 chuỗi text ─────────────────────────────
  private extractJsonObject(text: string): string | null {
    const trimmed = text.trim();

    // Trường hợp đơn giản: toàn bộ text là JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed;
    }

    // Fallback: dùng regex tìm object { } đầu tiên (bao gồm nested)
    const match = trimmed.match(/\{[\s\S]*\}/);
    return match ? match[0] : null;
  }
}
