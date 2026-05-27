import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('Plant')
export class PlantEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  plant_id!: string;

  @Column({ type: 'varchar', length: 50 })
  name_plant!: string;

  @Column({ type: 'varchar', length: 50 })
  address!: string;

  @Column({ type: 'varchar', length: 50 })
  manager_name!: string;

  @Column({ type: 'varchar', length: 50 })
  phone!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: string;
}
