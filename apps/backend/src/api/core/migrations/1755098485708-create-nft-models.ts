import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateNftModels1755098485708 implements MigrationInterface {
  readonly name: string = 'CreateNftModels1755098485708'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "nft_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token_id" character varying NOT NULL, "session_id" character varying NOT NULL, "contract_address" character varying NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_39b1100285dba9714cf579b7373" PRIMARY KEY ("nft_id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0fca1a8c5d9399d9a9a52e26f7" ON "nft" ("token_id", "contract_address") `
    )
    await queryRunner.query(
      `CREATE TABLE "nft_supply" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "nft_supply_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "url" character varying NOT NULL, "code" character varying NOT NULL, "contract_address" character varying NOT NULL, "session_id" character varying NOT NULL, "resource" character varying NOT NULL, "total_supply" integer NOT NULL, "current_supply" integer DEFAULT '0', "issuer" character varying, CONSTRAINT "PK_ae65976fb93785050bc3a794494" PRIMARY KEY ("nft_supply_id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "nft" ADD CONSTRAINT "FK_5c9c2fd34e6b1ed340e8cb3e0c9" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_5c9c2fd34e6b1ed340e8cb3e0c9"`)
    await queryRunner.query(`DROP TABLE "nft_supply"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_0fca1a8c5d9399d9a9a52e26f7"`)
    await queryRunner.query(`DROP TABLE "nft"`)
  }
}
