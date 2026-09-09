import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePolicyChunks1788876625548 implements MigrationInterface {
    name = 'CreatePolicyChunks1788876625548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "policy_chunks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "documentName" character varying(255) NOT NULL, "section" character varying(255), "content" text NOT NULL, "embedding" vector(3072) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1348fc0ef2b75ecb6e1fbe77cf2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "policy_chunks"`);
    }

}
