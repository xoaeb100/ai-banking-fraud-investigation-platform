import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialRoles1787232985115 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
  INSERT INTO "roles" ("name", "description")
  VALUES
    ('ADMIN', 'Full system administrator'),
    ('FRAUD_ANALYST', 'Analyzes suspicious transactions and fraud alerts'),
    ('INVESTIGATOR', 'Investigates and manages fraud cases'),
    ('AUDITOR', 'Reviews system activity and audit records')
  ON CONFLICT ("name") DO NOTHING
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DELETE FROM "roles"
    WHERE "name" IN (
      'ADMIN',
      'FRAUD_ANALYST',
      'INVESTIGATOR',
      'AUDITOR'
    )
  `);
  }
}
