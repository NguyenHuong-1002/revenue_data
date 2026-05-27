import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateNotificationTable1716799200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notification',
        columns: [
          {
            name: 'notification_id',
            type: 'varchar',
            length: '50',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'account_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['SYSTEM', 'INVENTORY_ALERT', 'NEW_SALE', 'CUSTOMER_NEW', 'OTHER'],
            default: "'SYSTEM'",
            isNullable: false,
          },
          {
            name: 'read_at',
            type: 'datetime',
            isNullable: true,
            default: 'NULL',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Tạo các indexes
    await queryRunner.createIndex(
      'notification',
      new TableIndex({
        name: 'idx_noti_account',
        columnNames: ['account_id'],
      }),
    );

    await queryRunner.createIndex(
      'notification',
      new TableIndex({
        name: 'idx_noti_read',
        columnNames: ['read_at'],
      }),
    );

    // Tạo Khóa ngoại (Foreign Key) liên kết đến bảng account
    await queryRunner.createForeignKey(
      'notification',
      new TableForeignKey({
        name: 'fk_noti_account',
        columnNames: ['account_id'],
        referencedColumnNames: ['account_id'],
        referencedTableName: 'account',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('notification', 'fk_noti_account');
    await queryRunner.dropIndex('notification', 'idx_noti_account');
    await queryRunner.dropIndex('notification', 'idx_noti_read');
    await queryRunner.dropTable('notification');
  }
}
