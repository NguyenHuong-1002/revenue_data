import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('saleReport')
export class SaleReportEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  sale_id!: string;

  @Column({ type: 'varchar', length: 50 })
  product_id!: string;

  @Column({ type: 'varchar', length: 50 })
  customer_id!: string;

  @Column({ type: 'int', default: 0 })
  sold_quantity!: number;

  @Column({
    type: 'enum',
    enum: ['Online', 'Bán lẻ', 'Phát sinh', 'Bán sỉ', 'Siêu thị', 'Hợp đồng'],
  })
  distribution_channel!: 'Online' | 'Bán lẻ' | 'Phát sinh' | 'Bán sỉ' | 'Siêu thị' | 'Hợp đồng';

  @Column({ type: 'varchar', length: 50 })
  branch_id!: string;

  @Column({ type: 'datetime' })
  time_report!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: string;
}
