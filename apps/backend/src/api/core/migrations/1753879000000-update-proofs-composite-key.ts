import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateProofsCompositeKey1753879000000 implements MigrationInterface {
  readonly name: string = 'UpdateProofsCompositeKey1753879000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proofs" DROP CONSTRAINT "proofs_pkey"`)
    await queryRunner.query(
      `ALTER TABLE "proofs" ADD CONSTRAINT "proofs_pkey" PRIMARY KEY ("receiver_address", "contract_address")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proofs" DROP CONSTRAINT "proofs_pkey"`)
    await queryRunner.query(`ALTER TABLE "proofs" ADD CONSTRAINT "proofs_pkey" PRIMARY KEY ("receiver_address")`)
  }
}
