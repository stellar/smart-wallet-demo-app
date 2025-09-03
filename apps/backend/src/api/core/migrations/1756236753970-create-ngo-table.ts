import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateNgoTable1756236753970 implements MigrationInterface {
  readonly name: string = 'CreateNgoTable1756236753970'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ngo" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "ngo_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "wallet_address" character varying NOT NULL, "profile_image" character varying, CONSTRAINT "PK_b7d9e134fb01771c7ff5a8dd1c8" PRIMARY KEY ("ngo_id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ngo"`)
  }
}
