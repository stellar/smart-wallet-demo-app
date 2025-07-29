import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdatePasskeyHexPublicKeyColumn1753737810118 implements MigrationInterface {
  name: string = 'UpdatePasskeyHexPublicKeyColumn1753737810118'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "passkey" ADD "credential_hex_public_key" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "passkey" DROP COLUMN "credential_hex_public_key"`)
  }
}
