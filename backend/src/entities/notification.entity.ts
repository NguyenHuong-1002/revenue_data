import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AccountEntity } from './account.entity';

@Entity('notification')
export class NotificationEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  notification_id!: string;

  @Column({ name: 'account_id', type: 'varchar', length: 50, nullable: true })
  account_id!: string | null;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: ['SYSTEM', 'INVENTORY_ALERT', 'NEW_SALE', 'CUSTOMER_NEW', 'OTHER'],
    default: 'SYSTEM',
  })
  type!: 'SYSTEM' | 'INVENTORY_ALERT' | 'NEW_SALE' | 'CUSTOMER_NEW' | 'OTHER';

  @Column({ type: 'datetime', nullable: true, default: null })
  read_at!: Date | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity | null;
}
