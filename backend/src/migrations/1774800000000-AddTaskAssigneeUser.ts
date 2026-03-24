import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskAssigneeUser1774800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "project_tasks"
      ADD COLUMN "assignee_user_id" uuid NULL,
      ADD CONSTRAINT "fk_project_tasks_assignee_user"
        FOREIGN KEY ("assignee_user_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "project_tasks"
      DROP CONSTRAINT IF EXISTS "fk_project_tasks_assignee_user",
      DROP COLUMN IF EXISTS "assignee_user_id"
    `);
  }
}
