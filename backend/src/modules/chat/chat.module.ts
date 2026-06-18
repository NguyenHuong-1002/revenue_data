import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatSession } from '../../entities/chat-session.entity';
import { ChatMessage } from '../../entities/chat-message.entity';
import { DatabaseModule } from '../../models/database.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatSession, ChatMessage]), DatabaseModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
