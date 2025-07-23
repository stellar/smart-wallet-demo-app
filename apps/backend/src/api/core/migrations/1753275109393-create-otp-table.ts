import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateOtpTable1753275109393 implements MigrationInterface {
  name: string = 'CreateOtpTable1753275109393'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "otp" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "otp_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(6) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "otp_code_unique" UNIQUE ("code"), CONSTRAINT "otp_pkey" PRIMARY KEY ("otp_id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "otp" ADD CONSTRAINT "otp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "otp" DROP CONSTRAINT "otp_user_id_fkey"`)
    await queryRunner.query(`DROP TABLE "otp"`)
  }
}
