import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('customer')
export class CustomerEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  customer_id!: string;

  @Column({ type: 'varchar', length: 50 })
  phone!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: string;
}
