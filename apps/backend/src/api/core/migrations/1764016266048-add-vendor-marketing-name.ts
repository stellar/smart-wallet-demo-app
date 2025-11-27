import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddVendorMarketingName1764016266048 implements MigrationInterface {
  readonly name: string = 'AddVendorMarketingName1764016266048'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vendor" ADD "marketing_name" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vendor" DROP COLUMN "marketing_name"`)
  }
}
