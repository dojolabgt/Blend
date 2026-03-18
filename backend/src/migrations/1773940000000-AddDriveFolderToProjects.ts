import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDriveFolderToProjects1773940000000 implements MigrationInterface {
  name = 'AddDriveFolderToProjects1773940000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "drive_folder_id" character varying DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "drive_folder_url" character varying DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN IF EXISTS "drive_folder_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN IF EXISTS "drive_folder_id"`,
    );
  }
}
