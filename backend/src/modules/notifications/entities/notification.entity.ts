import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('notification')
export class NotificationEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  notification_id!: string;

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

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
