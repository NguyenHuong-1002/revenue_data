import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { StoreBranchEntity } from '../../branches/entities/branch.entity';

@Entity('saleReport')
export class SaleReportEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  sale_id!: string;

  @Column({ type: 'varchar', length: 50 })
  product_id!: string;

  @Column({ type: 'int', default: 0 })
  sold_quantity!: number;

  @Column({
    type: 'enum',
    enum: ['Online', 'Bán lẻ', 'Phát sinh', 'Bán sỉ', 'Siêu thị', 'Hợp đồng', 'Chi nhánh'],
  })
  distribution_channel!:
    | 'Online'
    | 'Bán lẻ'
    | 'Phát sinh'
    | 'Bán sỉ'
    | 'Siêu thị'
    | 'Hợp đồng'
    | 'Chi nhánh';

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

  @ManyToOne(() => ProductEntity, { eager: false })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'product_id', foreignKeyConstraintName: 'FK_sale_product' })
  product!: ProductEntity;

  @ManyToOne(() => StoreBranchEntity, { eager: false })
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'store_id', foreignKeyConstraintName: 'FK_sale_branch' })
  branch!: StoreBranchEntity;
}
