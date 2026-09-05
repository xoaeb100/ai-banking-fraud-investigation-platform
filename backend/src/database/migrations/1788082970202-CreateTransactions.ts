import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransactions1788082970202 implements MigrationInterface {
    name = 'CreateTransactions1788082970202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_transactiontype_enum" AS ENUM('PURCHASE', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_frauddetectionstatus_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'YET_TO_PROCESS', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customerId" uuid NOT NULL, "amount" numeric(15,2) NOT NULL, "currency" character varying(3) NOT NULL, "merchantId" character varying(100) NOT NULL, "merchantCategory" character varying(100) NOT NULL, "transactionType" "public"."transactions_transactiontype_enum" NOT NULL, "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'PENDING', "transactionTime" TIMESTAMP WITH TIME ZONE NOT NULL, "fraudDetectionStatus" "public"."transactions_frauddetectionstatus_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_transactions_customer_time" ON "transactions" ("customerId", "transactionTime") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_transactions_customer_time"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_frauddetectionstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_transactiontype_enum"`);
    }

}
