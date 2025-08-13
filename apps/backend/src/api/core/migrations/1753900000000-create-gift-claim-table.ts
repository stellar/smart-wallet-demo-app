import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateGiftClaimTableWithHash1753900000000 implements MigrationInterface {
  readonly name: string = 'CreateGiftClaimTableWithHash1753900000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "gift_claim" (
        "gift_id_hash" text PRIMARY KEY,
        "user_id" UUID REFERENCES "user"("user_id"),
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gift_claim"`)
  }
}
