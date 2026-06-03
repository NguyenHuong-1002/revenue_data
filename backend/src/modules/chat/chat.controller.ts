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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService, ChatMessagePayload } from './chat.service';
import {
  ApiGetSessionsSwagger,
  ApiCreateSessionSwagger,
  ApiUpdateSessionTitleSwagger,
  ApiUpdateSessionDescriptionSwagger,
  ApiTogglePinSessionSwagger,
  ApiDeleteAllSessionsSwagger,
  ApiDeleteSessionSwagger,
  ApiGetMessagesSwagger,
  ApiClearMessagesSwagger,
  ApiGetChatCompletionSwagger,
} from './chat.swagger';

@ApiTags('Chat AI')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ─── Sessions ────────────────────────────────────────────────────────────────

  @ApiGetSessionsSwagger()
  @Get('sessions')
  getSessions() {
    return this.chatService.getSessions();
  }

  @ApiCreateSessionSwagger()
  @Post('sessions')
  createSession(@Body('title') title?: string) {
    return this.chatService.createSession(title);
  }

  @ApiUpdateSessionTitleSwagger()
  @Patch('sessions/:id/title')
  updateTitle(@Param('id', ParseIntPipe) id: number, @Body('title') title: string) {
    if (!title?.trim()) throw new BadRequestException('Title is required');
    return this.chatService.updateSessionTitle(id, title);
  }

  @ApiUpdateSessionDescriptionSwagger()
  @Patch('sessions/:id/description')
  updateDescription(
    @Param('id', ParseIntPipe) id: number,
    @Body('description') description: string,
  ) {
    return this.chatService.updateSessionDescription(id, description ?? '');
  }

  @ApiTogglePinSessionSwagger()
  @Patch('sessions/:id/pin')
  togglePin(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.togglePin(id);
  }

  @ApiDeleteAllSessionsSwagger()
  @Delete('sessions')
  deleteAllSessions() {
    return this.chatService.deleteAllSessions();
  }

  @ApiDeleteSessionSwagger()
  @Delete('sessions/:id')
  deleteSession(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.deleteSession(id);
  }

  // ─── Messages ─────────────────────────────────────────────────────────────────

  @ApiGetMessagesSwagger()
  @Get('sessions/:id/messages')
  getMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getMessages(id);
  }

  @ApiClearMessagesSwagger()
  @Delete('sessions/:id/messages')
  clearMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.clearMessages(id);
  }

  // ─── AI Completion ────────────────────────────────────────────────────────────

  @ApiGetChatCompletionSwagger()
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
