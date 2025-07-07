import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUser1751925511995 implements MigrationInterface {
  name: string = 'AddUser1751925511995'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying, "unique_token" character varying, "public_key" character varying, CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`)
  }
}
