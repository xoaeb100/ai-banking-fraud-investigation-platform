import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAlerts1788859376579 implements MigrationInterface {
    name = 'CreateAlerts1788859376579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."alerts_risklevel_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`);
        await queryRunner.query(`CREATE TYPE "public"."alerts_status_enum" AS ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED')`);
        await queryRunner.query(`CREATE TABLE "alerts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionId" uuid NOT NULL, "customerId" uuid NOT NULL, "riskScore" numeric(5,2) NOT NULL, "riskLevel" "public"."alerts_risklevel_enum" NOT NULL, "mlFraudProbability" numeric(5,4) NOT NULL, "transactionsLast10Min" integer NOT NULL, "transactionsLast1Hour" integer NOT NULL, "transactionsLast24h" integer NOT NULL, "amountDeviation" numeric, "amountRatio" numeric, "isUnusualTransactionTime" boolean NOT NULL, "isNewMerchant" boolean NOT NULL, "isNewMerchantCategory" boolean NOT NULL, "isNewTransactionType" boolean NOT NULL, "reasons" jsonb NOT NULL, "status" "public"."alerts_status_enum" NOT NULL DEFAULT 'OPEN', "assignedTo" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_60f895662df096bfcdfab7f4b96" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "alerts"`);
        await queryRunner.query(`DROP TYPE "public"."alerts_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."alerts_risklevel_enum"`);
    }

}
