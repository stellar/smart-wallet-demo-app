import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTxHashOnNftEntity1755712150986 implements MigrationInterface {
  readonly name: string = 'AddTxHashOnNftEntity1755712150986'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" ADD "transaction_hash" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "transaction_hash"`)
  }
}
