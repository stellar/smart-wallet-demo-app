import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddVendorDisplayOrder1763486184641 implements MigrationInterface {
  readonly name: string = 'AddVendorDisplayOrder1763486184641'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vendor" ADD "display_order" integer NOT NULL DEFAULT '0'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vendor" DROP COLUMN "display_order"`)
  }
}
