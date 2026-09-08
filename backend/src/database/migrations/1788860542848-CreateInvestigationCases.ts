import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInvestigationCases1788860542848 implements MigrationInterface {
    name = 'CreateInvestigationCases1788860542848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."investigation_cases_status_enum" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED')`);
        await queryRunner.query(`CREATE TABLE "investigation_cases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "alertId" uuid NOT NULL, "transactionId" uuid NOT NULL, "customerId" uuid NOT NULL, "status" "public"."investigation_cases_status_enum" NOT NULL DEFAULT 'OPEN', "assignedTo" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8084493c5102609627bbc8fec6a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "investigation_cases"`);
        await queryRunner.query(`DROP TYPE "public"."investigation_cases_status_enum"`);
    }

}
