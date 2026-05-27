import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('product')
export class ProductEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  product_id!: string;

  @Column({ type: 'varchar', length: 50 })
  color!: string;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  listing_price!: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  price_cost!: number;

  @Column({ type: 'enum', enum: ['MEN', 'WOM', 'BOY', 'GIR'] })
  gender!: 'MEN' | 'WOM' | 'BOY' | 'GIR';

  @Column({
    type: 'enum',
    enum: [
      'SANTD',
      'DEPTD',
      'GTTPC',
      'GTTCD',
      'SANTR',
      'GIATR',
      'PKIEN',
      'TBLTH',
      'TBLTR',
    ],
  })
  detail_product_group!:
    | 'SANTD'
    | 'DEPTD'
    | 'GTTPC'
    | 'GTTCD'
    | 'SANTR'
    | 'GIATR'
    | 'PKIEN'
    | 'TBLTH'
    | 'TBLTR';

  @Column({ type: 'varchar', length: 20 })
  size!: string;

  @Column({
    type: 'enum',
    enum: [
      '24 đến <40 tuổi',
      '40 đến <60 tuổi',
      '0 đến <3 tuổi',
      'Trên 60 tuổi',
      '6 đến <10 tuổi',
      '3 đến <6 tuổi',
      '10 đến <16 tuổi',
      'Khác',
    ],
  })
  age_group!:
    | '24 đến <40 tuổi'
    | '40 đến <60 tuổi'
    | '0 đến <3 tuổi'
    | 'Trên 60 tuổi'
    | '6 đến <10 tuổi'
    | '3 đến <6 tuổi'
    | '10 đến <16 tuổi'
    | 'Khác';

  @Column({
    type: 'enum',
    enum: [
      'Thường nhật/Trường học',
      'Thể thao',
      'Văn phòng',
      'Chuyên biệt',
      'Khác',
    ],
  })
  activity_group!:
    | 'Thường nhật/Trường học'
    | 'Thể thao'
    | 'Văn phòng'
    | 'Chuyên biệt'
    | 'Khác';

  @Column({
    type: 'enum',
    enum: ['Sport', 'Casual', 'Fashion', 'Formal', 'Khác'],
  })
  lifestyle_group!: 'Sport' | 'Casual' | 'Fashion' | 'Formal' | 'Khác';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: string;
}
