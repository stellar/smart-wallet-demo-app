import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFaq1763643694903 implements MigrationInterface {
  name: string = 'AddFaq1763643694903'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "faq" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "faq_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_50ee7238d5f3acb0711d8eaa258" PRIMARY KEY ("faq_id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "faq"`)
  }
}
