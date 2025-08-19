import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateFeatureFlag1755035264774 implements MigrationInterface {
  readonly name: string = 'CreateFeatureFlag1755035264774'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "feature_flag" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "feature_flag_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "description" character varying, "metadata" jsonb, CONSTRAINT "UQ_0cb1810eca363db1e0bf13c3cf3" UNIQUE ("name"), CONSTRAINT "PK_2c84309c4d5a20ad4eee4ec914e" PRIMARY KEY ("feature_flag_id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "feature_flag"`)
  }
}
