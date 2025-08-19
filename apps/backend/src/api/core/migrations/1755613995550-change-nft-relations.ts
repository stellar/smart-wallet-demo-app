import { MigrationInterface, QueryRunner } from 'typeorm'

export class ChangeNftRelations1755613995550 implements MigrationInterface {
  readonly name: string = 'ChangeNftRelations1755613995550'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" RENAME COLUMN "session_id" TO "nft_supply_id"`)
    await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "nft_supply_id"`)
    await queryRunner.query(`ALTER TABLE "nft" ADD "nft_supply_id" uuid NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "nft" ADD CONSTRAINT "UQ_f021450a1d381ce2b23f0ff4e8e" UNIQUE ("nft_supply_id")`
    )
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_414dfc2d780b1aba225cf4cbd1" ON "nft_supply" ("session_id") `)
    await queryRunner.query(
      `ALTER TABLE "nft" ADD CONSTRAINT "FK_f021450a1d381ce2b23f0ff4e8e" FOREIGN KEY ("nft_supply_id") REFERENCES "nft_supply"("nft_supply_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_f021450a1d381ce2b23f0ff4e8e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_414dfc2d780b1aba225cf4cbd1"`)
    await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "UQ_f021450a1d381ce2b23f0ff4e8e"`)
    await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "nft_supply_id"`)
    await queryRunner.query(`ALTER TABLE "nft" ADD "nft_supply_id" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "nft" RENAME COLUMN "nft_supply_id" TO "session_id"`)
  }
}
