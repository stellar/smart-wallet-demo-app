import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateVendorAndAssetTables1753815882564 implements MigrationInterface {
  name = 'CreateVendorAndAssetTables1753815882564'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "asset" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "asset_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "code" character varying NOT NULL, "type" character varying NOT NULL, "contract_address" character varying NOT NULL, CONSTRAINT "PK_2a48e81afa7729ed31c2c7b18ed" PRIMARY KEY ("asset_id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "vendor" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "vendor_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "contract_address" character varying, "profile_image" character varying, CONSTRAINT "PK_f82665d231fd62808e6953014b2" PRIMARY KEY ("vendor_id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "vendor"`)
    await queryRunner.query(`DROP TABLE "asset"`)
  }
}
