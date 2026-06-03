import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_session')
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: 'Cuộc hội thoại mới' })
  title: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({ name: 'is_pinned', type: 'tinyint', default: 0 })
  isPinned: boolean;

  @Column({ name: 'last_accessed_at', type: 'datetime', nullable: true, default: null })
  lastAccessedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ChatMessage, (msg) => msg.session, { cascade: true })
  messages: ChatMessage[];
}
