import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddProofs1752080382185 implements MigrationInterface {
  name: string = 'AddProofs1752080382185'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "proofs" ("receiver_address" character varying NOT NULL, "contract_address" character varying NOT NULL, "index" integer NOT NULL, "receiver_amount" bigint NOT NULL, "proofs" text array NOT NULL, "created_at" TIMESTAMP NOT NULL, CONSTRAINT "proofs_pkey" PRIMARY KEY ("receiver_address"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "proofs"`)
  }
}
