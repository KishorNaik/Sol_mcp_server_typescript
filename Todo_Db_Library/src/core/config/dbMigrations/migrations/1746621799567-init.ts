import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1746621799567 implements MigrationInterface {
    name = 'Init1746621799567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."to_do_entity_status_enum" AS ENUM('1', '0')`);
        await queryRunner.query(`CREATE TABLE "to_do_entity" ("id" BIGSERIAL NOT NULL, "identifier" character varying(50) NOT NULL, "status" "public"."to_do_entity_status_enum" NOT NULL DEFAULT '0', "created_date" TIMESTAMP(6) NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "modified_date" TIMESTAMP(6) NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "version" integer NOT NULL, "title" character varying(255) NOT NULL, "description" text, CONSTRAINT "PK_03a5a499425f9667b78f8d04206" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4988f11d6114e06a52524ed241" ON "to_do_entity" ("identifier") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4988f11d6114e06a52524ed241"`);
        await queryRunner.query(`DROP TABLE "to_do_entity"`);
        await queryRunner.query(`DROP TYPE "public"."to_do_entity_status_enum"`);
    }

}
