import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('storeBranch')
export class StoreBranchEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  store_id!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  city!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: string;
}
