import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUniqueNftSupplyPerUser1757606895593 implements MigrationInterface {
  readonly name: string = 'AddUniqueNftSupplyPerUser1757606895593'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d99cd8c42523de5073fc58093a" ON "nft" ("user_id", "nft_supply_id") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_d99cd8c42523de5073fc58093a"`)
  }
}
