import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUser1752000217627 implements MigrationInterface {
  name: string = 'AddUser1752000217627'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "unique_token" character varying NOT NULL, "public_key" character varying, CONSTRAINT "user_pkey" PRIMARY KEY ("user_id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`)
  }
}
