import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCreatedAccountAddressToUser1756300000000 implements MigrationInterface {
  readonly name: string = 'AddCreatedAccountAddressToUser1756300000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "created_account_address" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_account_address"`)
  }
}
