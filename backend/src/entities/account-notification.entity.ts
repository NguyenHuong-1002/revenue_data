import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AccountEntity } from './account.entity';
import { NotificationEntity } from './notification.entity';

@Entity('account_notification')
export class AccountNotificationEntity {
  @PrimaryColumn({ name: 'account_id', type: 'varchar', length: 50 })
  account_id!: string;

  @PrimaryColumn({ name: 'notification_id', type: 'varchar', length: 50 })
  notification_id!: string;

  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  is_read!: number;

  @Column({ name: 'read_at', type: 'datetime', nullable: true, default: null })
  read_at!: Date | null;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  is_deleted!: number;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true, default: null })
  deleted_at!: Date | null;

  @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity;

  @ManyToOne(() => NotificationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification!: NotificationEntity;
}
