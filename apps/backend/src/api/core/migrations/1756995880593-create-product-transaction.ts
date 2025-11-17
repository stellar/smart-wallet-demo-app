import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductTransaction1756995880593 implements MigrationInterface {
  readonly name: string = 'CreateProductTransaction1756995880593'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_transaction" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "product_transaction_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transaction_hash" character varying NOT NULL, "product_id" uuid, CONSTRAINT "PK_0169b20a93385041f6d3b1fc134" PRIMARY KEY ("product_transaction_id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "product_transaction" ADD CONSTRAINT "FK_4baf1e25b54568281da6789eb41" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_transaction" DROP CONSTRAINT "FK_4baf1e25b54568281da6789eb41"`)
    await queryRunner.query(`DROP TABLE "product_transaction"`)
  }
}
