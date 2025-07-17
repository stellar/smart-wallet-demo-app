import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateUserContractColumn1752774997123 implements MigrationInterface {
  name: string = 'UpdateUserContractColumn1752774997123'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "public_key" TO "contract_address"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "contract_address" TO "public_key"`)
  }
}
