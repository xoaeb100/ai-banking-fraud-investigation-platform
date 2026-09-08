import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFraudProcessingStartedAt1788779546818 implements MigrationInterface {
    name = 'AddFraudProcessingStartedAt1788779546818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "fraudProcessingStartedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "fraudProcessingStartedAt"`);
    }

}
