import { MigrationInterface, QueryRunner } from 'typeorm'

export class ChangeNftConstraints1755616629243 implements MigrationInterface {
  readonly name: string = 'ChangeNftConstraints1755616629243'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_414dfc2d780b1aba225cf4cbd1"`)
    await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_f021450a1d381ce2b23f0ff4e8e"`)
    await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "UQ_f021450a1d381ce2b23f0ff4e8e"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_825a6afd8a97552a6543c16d51" ON "nft_supply" ("session_id", "resource", "contract_address") `
    )
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f021450a1d381ce2b23f0ff4e8" ON "nft" ("nft_supply_id") `)
    await queryRunner.query(
      `ALTER TABLE "nft" ADD CONSTRAINT "FK_f021450a1d381ce2b23f0ff4e8e" FOREIGN KEY ("nft_supply_id") REFERENCES "nft_supply"("nft_supply_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_f021450a1d381ce2b23f0ff4e8e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_f021450a1d381ce2b23f0ff4e8"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_825a6afd8a97552a6543c16d51"`)
    await queryRunner.query(
      `ALTER TABLE "nft" ADD CONSTRAINT "UQ_f021450a1d381ce2b23f0ff4e8e" UNIQUE ("nft_supply_id")`
    )
    await queryRunner.query(
      `ALTER TABLE "nft" ADD CONSTRAINT "FK_f021450a1d381ce2b23f0ff4e8e" FOREIGN KEY ("nft_supply_id") REFERENCES "nft_supply"("nft_supply_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_414dfc2d780b1aba225cf4cbd1" ON "nft_supply" ("session_id") `)
  }
}
