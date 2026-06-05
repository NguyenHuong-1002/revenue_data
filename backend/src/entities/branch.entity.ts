import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('storeBranch')
export class StoreBranchEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  store_id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  address!: string | null;

  @Column({ type: 'double', nullable: true, default: null })
  latitude!: number | null;

  @Column({ type: 'double', nullable: true, default: null })
  longitude!: number | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
