import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('InventoryReport')
export class InventoryReportEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  inventory_id!: string;

  @Column({ type: 'varchar', length: 50 })
  product_id!: string;

  @Column({ type: 'varchar', length: 50 })
  plant_id!: string;

  @Column({ type: 'datetime', nullable: true })
  calendar_year_week!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at!: string;
}
