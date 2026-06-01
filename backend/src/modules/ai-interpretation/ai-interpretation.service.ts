import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InterpretationRequestDto, InterpretationLanguage } from './DTO/interpretation-request.dto';
import { IInterpretationResponse, IInterpretationSummary } from './interfaces/interpretation.interface';

type DeepSeekChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type DeepSeekChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

@Injectable()
export class AiInterpretationService {
  private readonly logger = new Logger(AiInterpretationService.name);

  async interpret(dto: InterpretationRequestDto): Promise<IInterpretationResponse> {
    this.validateInput(dto);

    const apiKey = process.env.DEEPSEEK_API_KEY ?? process.env.API_DEEP;
    if (!apiKey) {
      throw new InternalServerErrorException('Missing DeepSeek API key in environment');
    }

    const baseUrl = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com';
    const model = process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-pro';

    const messages = this.buildMessages(dto);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`DeepSeek API error ${response.status}: ${errorText}`);
      throw new InternalServerErrorException('DeepSeek API request failed');
    }

    const data = (await response.json()) as DeepSeekChatCompletionResponse;
    const rawContent = data.choices?.[0]?.message?.content?.trim() ?? '';

    if (!rawContent) {
      throw new InternalServerErrorException('DeepSeek returned empty content');
    }

    const content = this.parseAssistantContent(rawContent);

    return {
      provider: 'deepseek',
      model,
      content,
      rawContent,
    };
  }

  private validateInput(dto: InterpretationRequestDto): void {
    if (!dto.reportTitle || !dto.reportTitle.trim()) {
      throw new BadRequestException('reportTitle is required');
    }
  }

  private buildMessages(dto: InterpretationRequestDto): DeepSeekChatMessage[] {
    const facts = this.buildFacts(dto);
    const languageInstruction =
      dto.language === InterpretationLanguage.EN
        ? 'Reply in English.'
        : 'Trả lời bằng tiếng Việt.';

    return [
      {
        role: 'system',
        content: [
          'Bạn là chuyên gia phân tích dữ liệu bán lẻ và tư vấn chiến lược kinh doanh.',
          'Chỉ sử dụng đúng các số liệu được cung cấp trong phần user.',
          'Không tự bịa thêm số liệu, không suy luận vượt quá dữ kiện.',
          'Hãy trả về CHÍNH XÁC JSON hợp lệ, không markdown, không giải thích thêm.',
          'Schema bắt buộc:',
          '{',
          '  "summaryBullets": ["... tối đa 3 gạch đầu dòng ..."],',
          '  "recommendation": "... một lời khuyên thực tế ..."',
          '}',
          'Nếu dữ liệu thiếu, hãy nói rõ là chưa đủ dữ liệu thay vì tự tạo số liệu.',
        ].join(' '),
      },
      {
        role: 'user',
        content: [
          dto.reportTitle.trim(),
          facts,
          dto.additionalContext ? `Ghi chú bổ sung: ${dto.additionalContext}` : '',
          languageInstruction,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    ];
  }

  private buildFacts(dto: InterpretationRequestDto): string {
    const lines: string[] = [];

    if (dto.totalRevenue !== undefined) {
      lines.push(`Tổng doanh thu: ${dto.totalRevenue.toLocaleString('vi-VN')} VNĐ`);
    }

    if (dto.revenueChangePercent !== undefined) {
      const sign = dto.revenueChangePercent > 0 ? 'Tăng' : dto.revenueChangePercent < 0 ? 'Giảm' : 'Không đổi';
      lines.push(`${sign} ${Math.abs(dto.revenueChangePercent)}% so với kỳ trước`);
    }

    if (dto.topProductName || dto.topProductCode || dto.topProductSoldQuantity !== undefined) {
      const parts: string[] = [];
      if (dto.topProductName) parts.push(dto.topProductName);
      if (dto.topProductCode) parts.push(`Mã SP: ${dto.topProductCode}`);
      if (dto.topProductSoldQuantity !== undefined) {
        parts.push(`Bán được ${dto.topProductSoldQuantity.toLocaleString('vi-VN')} chiếc`);
      }
      lines.push(`Top 1 bán chạy: ${parts.join(' - ')}`);
    }

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

  private parseAssistantContent(rawContent: string): IInterpretationSummary {
    const jsonText = this.extractJsonObject(rawContent);
    if (!jsonText) {
      return {
        summaryBullets: [rawContent],
        recommendation: '',
      };
    }

    try {
      const parsed = JSON.parse(jsonText) as Partial<IInterpretationSummary>;
      const summaryBullets = Array.isArray(parsed.summaryBullets)
        ? parsed.summaryBullets
            .map((item) => String(item).trim())
            .filter(Boolean)
            .slice(0, 3)
        : [];
      const recommendation = typeof parsed.recommendation === 'string' ? parsed.recommendation.trim() : '';

      return {
        summaryBullets,
        recommendation,
      };
    } catch {
      return {
        summaryBullets: [rawContent],
        recommendation: '',
      };
    }
  }

  private extractJsonObject(text: string): string | null {
    const trimmed = text.trim();

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed;
    }

    const match = trimmed.match(/\{[\s\S]*\}/);
    return match ? match[0] : null;
  }
}

