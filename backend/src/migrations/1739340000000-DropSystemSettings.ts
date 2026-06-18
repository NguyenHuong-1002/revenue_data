import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropSystemSettings1739340000000 implements MigrationInterface {
  name = 'DropSystemSettings1739340000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`system_settings\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`system_settings\` (
        \`key\` varchar(100) NOT NULL,
        \`value\` text NOT NULL,
        \`description\` varchar(255) NOT NULL DEFAULT '',
        \`type\` varchar(20) NOT NULL DEFAULT 'string',
        \`group\` varchar(50) NOT NULL DEFAULT 'general',
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`key\`)
      ) ENGINE=InnoDB`,
    );
  }
}
