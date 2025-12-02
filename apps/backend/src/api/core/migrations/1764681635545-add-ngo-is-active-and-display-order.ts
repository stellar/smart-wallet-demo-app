import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNgoIsActiveAndDisplayOrder1764681635545 implements MigrationInterface {
  readonly name: string = 'AddNgoIsActiveAndDisplayOrder1764681635545'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ngo" ADD "is_active" boolean NOT NULL DEFAULT true`)
    await queryRunner.query(`ALTER TABLE "ngo" ADD "display_order" integer NOT NULL DEFAULT '0'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "display_order"`)
    await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "is_active"`)
  }
}
