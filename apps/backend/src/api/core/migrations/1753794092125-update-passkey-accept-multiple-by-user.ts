import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdatePasskeyAcceptMultipleByUser1753794092125 implements MigrationInterface {
  name: string = 'UpdatePasskeyAcceptMultipleByUser1753794092125'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_0038e3eaa71d69dc4595e22f36"`)
    await queryRunner.query(
      `CREATE INDEX "IDX_0038e3eaa71d69dc4595e22f36" ON "passkey" ("webauthn_user_id", "user_id") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_0038e3eaa71d69dc4595e22f36"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0038e3eaa71d69dc4595e22f36" ON "passkey" ("user_id", "webauthn_user_id") `
    )
  }
}
