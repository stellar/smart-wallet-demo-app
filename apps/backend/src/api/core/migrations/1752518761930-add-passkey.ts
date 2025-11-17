import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPasskey1752518761930 implements MigrationInterface {
  name: string = 'AddPasskey1752518761930'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "passkey" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "credential_id" character varying(255) NOT NULL, "credential_public_key" bytea NOT NULL, "webauthn_user_id" character varying(255) NOT NULL, "counter" bigint NOT NULL, "label" character varying NOT NULL, "device_type" character varying(32) NOT NULL, "backed_up" boolean NOT NULL, "transports" character varying(255), "user_id" uuid NOT NULL, CONSTRAINT "PK_192d857208b2315375852a6e373" PRIMARY KEY ("credential_id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0038e3eaa71d69dc4595e22f36" ON "passkey" ("webauthn_user_id", "user_id") `
    )
    await queryRunner.query(
      `ALTER TABLE "passkey" ADD CONSTRAINT "FK_2cdd8c9fe25bcdab1c4ea3057be" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "passkey" DROP CONSTRAINT "FK_2cdd8c9fe25bcdab1c4ea3057be"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_0038e3eaa71d69dc4595e22f36"`)
    await queryRunner.query(`DROP TABLE "passkey"`)
  }
}
