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
import { ChatService, ChatMessagePayload } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  getSessions() {
    return this.chatService.getSessions();
  }

  @Post('sessions')
  createSession(@Body('title') title?: string) {
    return this.chatService.createSession(title);
  }

  @Patch('sessions/:id/title')
  updateTitle(@Param('id', ParseIntPipe) id: number, @Body('title') title: string) {
    if (!title?.trim()) throw new BadRequestException('Title is required');
    return this.chatService.updateSessionTitle(id, title);
  }

  @Patch('sessions/:id/description')
  updateDescription(
    @Param('id', ParseIntPipe) id: number,
    @Body('description') description: string,
  ) {
    return this.chatService.updateSessionDescription(id, description ?? '');
  }

  @Patch('sessions/:id/pin')
  togglePin(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.togglePin(id);
  }

  @Delete('sessions')
  deleteAllSessions() {
    return this.chatService.deleteAllSessions();
  }

  @Delete('sessions/:id')
  deleteSession(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.deleteSession(id);
  }

  @Get('sessions/:id/messages')
  getMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getMessages(id);
  }

  @Delete('sessions/:id/messages')
  clearMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.clearMessages(id);
  }

  @Post()
  async getChatCompletion(
    @Body('messages') messages: ChatMessagePayload[],
    @Body('sessionId') sessionId?: number,
  ) {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestException('Messages list must be a non-empty array');
    }
    return this.chatService.getChatCompletion(messages, sessionId);
  }
}
