import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import * as authGuard from 'src/guards/auth.guard';
import { ChatService, ChatMessagePayload } from './chat.service';

/**
 * Controller quản lý chat AI (DeepSeek/OpenRouter)
 * Routes: /chat
 */
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Lấy danh sách tất cả cuộc hội thoại
   * GET /chat/sessions
   */
  @Get('sessions')
  getChatSessions() {
    return this.chatService.getSessions();
  }

  /**
   * Tạo cuộc hội thoại mới
   * POST /chat/sessions
   */
  @Post('sessions')
  createChatSession(@Body('title') title?: string) {
    return this.chatService.createSession(title);
  }

  /**
   * Cập nhật tiêu đề cuộc hội thoại
   * PATCH /chat/sessions/:id/title
   */
  @Patch('sessions/:id/title')
  updateChatSessionTitle(@Param('id', ParseIntPipe) id: number, @Body('title') title: string) {
    if (!title?.trim()) throw new BadRequestException('Title is required');
    return this.chatService.updateSessionTitle(id, title);
  }

  /**
   * Cập nhật mô tả cuộc hội thoại
   * PATCH /chat/sessions/:id/description
   */
  @Patch('sessions/:id/description')
  updateChatSessionDescription(
    @Param('id', ParseIntPipe) id: number,
    @Body('description') description: string,
  ) {
    return this.chatService.updateSessionDescription(id, description ?? '');
  }

  /**
   * Ghim/hủy ghim cuộc hội thoại
   * PATCH /chat/sessions/:id/pin
   */
  @Patch('sessions/:id/pin')
  toggleChatSessionPin(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.togglePin(id);
  }

  /**
   * [ADMIN] Xóa toàn bộ cuộc hội thoại
   * DELETE /chat/sessions
   */
  @authGuard.Roles('ADMIN')
  @Delete('sessions')
  deleteAllChatSessions() {
    return this.chatService.deleteAllSessions();
  }

  /**
   * Xóa một cuộc hội thoại
   * DELETE /chat/sessions/:id
   */
  @Delete('sessions/:id')
  deleteChatSession(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.deleteSession(id);
  }

  /**
   * Lấy danh sách tin nhắn của cuộc hội thoại
   * GET /chat/sessions/:id/messages
   */
  @Get('sessions/:id/messages')
  getChatMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getMessages(id);
  }

  /**
   * Xóa toàn bộ tin nhắn trong cuộc hội thoại
   * DELETE /chat/sessions/:id/messages
   */
  @Delete('sessions/:id/messages')
  clearChatMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.clearMessages(id);
  }

  /**
   * Gửi tin nhắn đến AI và nhận phản hồi
   * POST /chat
   */
  @Post()
  async createChatCompletion(
    @Body('messages') messages: ChatMessagePayload[],
    @Body('sessionId') sessionId?: number,
  ) {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestException('Messages list must be a non-empty array');
    }
    return this.chatService.getChatCompletion(messages, sessionId);
  }
}
