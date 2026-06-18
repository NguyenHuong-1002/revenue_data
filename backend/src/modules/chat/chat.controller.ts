import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import * as authGuard from 'src/middlewares/auth.guard';
import { ChatService, ChatMessagePayload } from './chat.service';

@UseGuards(authGuard.AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  getChatSessions() {
    return this.chatService.getSessions();
  }

  @Post('sessions')
  createChatSession(@Body('title') title?: string) {
    return this.chatService.createSession(title);
  }

  @Patch('sessions/:id/title')
  updateChatSessionTitle(@Param('id', ParseIntPipe) id: number, @Body('title') title: string) {
    if (!title?.trim()) throw new BadRequestException('Title is required');
    return this.chatService.updateSessionTitle(id, title);
  }

  @Patch('sessions/:id/description')
  updateChatSessionDescription(
    @Param('id', ParseIntPipe) id: number,
    @Body('description') description: string,
  ) {
    return this.chatService.updateSessionDescription(id, description ?? '');
  }

  @Patch('sessions/:id/pin')
  toggleChatSessionPin(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.togglePin(id);
  }

  @authGuard.Roles('ADMIN')
  @Delete('sessions')
  deleteAllChatSessions() {
    return this.chatService.deleteAllSessions();
  }

  @Delete('sessions/:id')
  deleteChatSession(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.deleteSession(id);
  }

  @Get('sessions/:id/messages')
  getChatMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getMessages(id);
  }

  @Delete('sessions/:id/messages')
  clearChatMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.clearMessages(id);
  }

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
