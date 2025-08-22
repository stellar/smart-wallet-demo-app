import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveNftSupplyUniqueIdxFromNft1755870848753 implements MigrationInterface {
  readonly name: string = 'RemoveNftSupplyUniqueIdxFromNft1755870848753'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_f021450a1d381ce2b23f0ff4e8"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0fca1a8c5d9399d9a9a52e26f7" ON "nft" ("token_id", "contract_address") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_0fca1a8c5d9399d9a9a52e26f7"`)
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f021450a1d381ce2b23f0ff4e8" ON "nft" ("nft_supply_id") `)
  }
}
