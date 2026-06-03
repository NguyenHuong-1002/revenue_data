import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('landing_pricing')
export class LandingPricingEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  price!: string;

  @Column({ type: 'varchar', length: 50 })
  period!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'text' })
  features!: string; // JSON string format for array list

  @Column({ type: 'tinyint', default: 0 })
  popular!: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
