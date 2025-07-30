import { MigrationInterface, QueryRunner } from 'typeorm'

export class ChangeVendorWalletName1753878721324 implements MigrationInterface {
  name: string = 'ChangeVendorWalletName1753878721324'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vendor" RENAME COLUMN "contract_address" TO "wallet_address"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vendor" RENAME COLUMN "wallet_address" TO "contract_address"`)
  }
}
