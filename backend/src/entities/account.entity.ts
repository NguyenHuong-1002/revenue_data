import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('account')
export class AccountEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  account_id!: string;

  @Column({ type: 'enum', enum: ['ADMIN', 'STAFF'], default: 'STAFF' })
  role!: 'ADMIN' | 'STAFF';

  @Column({ type: 'varchar', length: 255 })
  fullname!: string;

  @Column({ type: 'varchar', length: 255 })
  username!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 255 })
  mail!: string;

  @Column({ type: 'varchar', length: 255 })
  avatarURL!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
