import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateSwagsRelations1755281738281 implements MigrationInterface {
  name: string = 'CreateSwagsRelations1755281738281'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_product" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_product_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL DEFAULT 'unclaimed', "claimed_at" TIMESTAMP, "user_id" uuid, "product_id" uuid, CONSTRAINT "PK_508b6614c3f2b962c8225ab0c68" PRIMARY KEY ("user_product_id"))`
    )
    await queryRunner.query(`ALTER TABLE "product" ADD "image_url" character varying`)
    await queryRunner.query(`ALTER TABLE "product" ADD "is_swag" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "product" ADD "is_hidden" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "product" ADD "asset_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_c56a83efd14ec4175532e1867fc" FOREIGN KEY ("asset_id") REFERENCES "asset"("asset_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_product" ADD CONSTRAINT "FK_743893c0c8936b585085e95df8e" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_product" ADD CONSTRAINT "FK_dadf8ea672e01452c23d6da9112" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_product" DROP CONSTRAINT "FK_dadf8ea672e01452c23d6da9112"`)
    await queryRunner.query(`ALTER TABLE "user_product" DROP CONSTRAINT "FK_743893c0c8936b585085e95df8e"`)
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_c56a83efd14ec4175532e1867fc"`)
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "asset_id"`)
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "is_hidden"`)
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "is_swag"`)
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "image_url"`)
    await queryRunner.query(`DROP TABLE "user_product"`)
  }
}
