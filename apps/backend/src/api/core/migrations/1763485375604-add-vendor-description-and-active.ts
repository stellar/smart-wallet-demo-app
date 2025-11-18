import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddVendorDescriptionAndActive1763485375604 implements MigrationInterface {
  readonly name: string = 'AddVendorDescriptionAndActive1763485375604'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vendor" ADD "description" character varying`)
    await queryRunner.query(`ALTER TABLE "vendor" ADD "is_active" boolean NOT NULL DEFAULT true`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vendor" DROP COLUMN "description"`)
    await queryRunner.query(`ALTER TABLE "vendor" DROP COLUMN "is_active"`)
  }
}
