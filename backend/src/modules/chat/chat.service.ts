import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ChatSession } from '../../entities/chat-session.entity';
import { ChatMessage } from '../../entities/chat-message.entity';

export type ChatMessagePayload = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,
  ) {}

  // ─── Sessions ────────────────────────────────────────────────────────────────

  async getSessions(): Promise<ChatSession[]> {
    // Pinned first, then by last_accessed_at desc, then by updated_at desc
    return this.sessionRepo
      .createQueryBuilder('s')
      .orderBy('s.isPinned', 'DESC')
      .addOrderBy('COALESCE(s.lastAccessedAt, s.updatedAt)', 'DESC')
      .getMany();
  }

  async createSession(title?: string): Promise<ChatSession> {
    const session = this.sessionRepo.create({
      title: title || 'Cuộc hội thoại mới',
      lastAccessedAt: new Date(),
    });
    return this.sessionRepo.save(session);
  }

  async updateSessionTitle(id: number, title: string): Promise<ChatSession> {
    const session = await this.findSessionOrFail(id);
    session.title = title;
    return this.sessionRepo.save(session);
  }

  async updateSessionDescription(id: number, description: string): Promise<ChatSession> {
    const session = await this.findSessionOrFail(id);
    session.description = description;
    return this.sessionRepo.save(session);
  }

  async togglePin(id: number): Promise<ChatSession> {
    const session = await this.findSessionOrFail(id);
    session.isPinned = !session.isPinned;
    return this.sessionRepo.save(session);
  }

  async touchSession(id: number): Promise<void> {
    await this.sessionRepo.update(id, { lastAccessedAt: new Date() });
  }

  async deleteSession(id: number): Promise<void> {
    const session = await this.findSessionOrFail(id);
    await this.sessionRepo.remove(session);
  }

  async deleteAllSessions(): Promise<{ deleted: number }> {
    const all = await this.sessionRepo.find();
    await this.sessionRepo.remove(all);
    return { deleted: all.length };
  }

  async getMessages(sessionId: number): Promise<ChatMessage[]> {
    await this.findSessionOrFail(sessionId);
    // Touch last accessed
    await this.touchSession(sessionId);
    return this.messageRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async clearMessages(sessionId: number): Promise<void> {
    await this.messageRepo.delete({ sessionId });
  }

  // ─── AI Chat Completion ───────────────────────────────────────────────────────

  async getChatCompletion(
    messages: ChatMessagePayload[],
    sessionId?: number,
  ): Promise<{ role: string; content: string }> {
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

    const hasSystemInstruction = messages.some((m) => m.role === 'system');
    const systemInstruction: ChatMessagePayload = {
      role: 'system',
      content:
        'Bạn là trợ lý AI thông minh tích hợp trong hệ thống quản lý doanh thu và dự báo. Hãy hỗ trợ người dùng giải đáp thắc mắc, phân tích dữ liệu, gợi ý chiến lược kinh doanh một cách lịch sự, chính xác và chuyên nghiệp bằng tiếng Việt.',
    };

    const finalMessages = hasSystemInstruction ? messages : [systemInstruction, ...messages];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    if (isOpenRouter) {
      headers['HTTP-Referer'] = 'https://revenue-ai.vn';
      headers['X-Title'] = 'Revenue AI Dashboard';
    }

    // Save user message to DB if sessionId provided
    if (sessionId) {
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg && lastUserMsg.role === 'user') {
        await this.messageRepo.save(
          this.messageRepo.create({
            sessionId,
            role: 'user',
            content: lastUserMsg.content,
          }),
        );
      }
      await this.touchSession(sessionId);
    }

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: finalMessages,
          stream: false,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`AI API error: ${response.status} - ${errorText}`);
        throw new InternalServerErrorException('AI API request failed');
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content ?? '';

      // Save assistant reply to DB if sessionId provided
      if (sessionId) {
        await this.messageRepo.save(
          this.messageRepo.create({ sessionId, role: 'assistant', content }),
        );

        // Auto-update session title from first user message
        const session = await this.sessionRepo.findOne({
          where: { id: sessionId },
        });
        const msgCount = await this.messageRepo.count({ where: { sessionId } });
        if (session && session.title === 'Cuộc hội thoại mới' && msgCount <= 2) {
          const firstUserMsg = messages.find((m) => m.role === 'user');
          if (firstUserMsg) {
            session.title =
              firstUserMsg.content.substring(0, 60) +
              (firstUserMsg.content.length > 60 ? '...' : '');
            await this.sessionRepo.save(session);
          }
        }
      }

      return { role: 'assistant', content };
    } catch (error: any) {
      this.logger.error('Error fetching chat completion', error.stack);
      throw new InternalServerErrorException('Failed to generate chat response');
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async findSessionOrFail(id: number): Promise<ChatSession> {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) throw new NotFoundException(`Session #${id} not found`);
    return session;
  }
}
