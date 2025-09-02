import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNftSoftDelete1756839553084 implements MigrationInterface {
  name: string = 'AddNftSoftDelete1756839553084'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" ADD "deleted_at" TIMESTAMP`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "deleted_at"`)
  }
}
