import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateProofsIsClaimedColumn1755020178642 implements MigrationInterface {
  name: string = 'UpdateProofsIsClaimedColumn1755020178642'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proofs" ADD "is_claimed" boolean NOT NULL DEFAULT false`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proofs" DROP COLUMN "is_claimed"`)
  }
}
