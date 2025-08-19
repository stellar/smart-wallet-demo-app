import { MigrationInterface, QueryRunner } from 'typeorm'

export class ChangeNftSupplyFieldCurrentSupplyToTotalMinted1755522116045 implements MigrationInterface {
  readonly name: string = 'ChangeNftSupplyFieldCurrentSupplyToTotalMinted1755522116045'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_0fca1a8c5d9399d9a9a52e26f7"`)
    await queryRunner.query(`ALTER TABLE "nft_supply" RENAME COLUMN "current_supply" TO "minted_amount"`)
    await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "token_id" DROP NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "token_id" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "nft_supply" RENAME COLUMN "minted_amount" TO "current_supply"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0fca1a8c5d9399d9a9a52e26f7" ON "nft" ("contract_address", "token_id") `
    )
  }
}
