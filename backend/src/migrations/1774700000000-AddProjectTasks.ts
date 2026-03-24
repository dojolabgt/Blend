import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectTasks1774700000000 implements MigrationInterface {
  name = 'AddProjectTasks1774700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."project_tasks_status_enum" AS ENUM('todo', 'in_progress', 'review', 'done')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."project_tasks_priority_enum" AS ENUM('low', 'medium', 'high')
    `);
    await queryRunner.query(`
      CREATE TABLE "project_tasks" (
        "id"                    uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id"            uuid NOT NULL,
        "title"                 character varying(512) NOT NULL,
        "description"           text,
        "status"                "public"."project_tasks_status_enum" NOT NULL DEFAULT 'todo',
        "priority"              "public"."project_tasks_priority_enum" NOT NULL DEFAULT 'medium',
        "position"              double precision NOT NULL DEFAULT 0,
        "due_date"              date,
        "assignee_workspace_id" uuid,
        "created_at"            TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"            TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_tasks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_tasks_project" FOREIGN KEY ("project_id")
          REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_tasks_assignee" FOREIGN KEY ("assignee_workspace_id")
          REFERENCES "workspaces"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_project_tasks_project_status" ON "project_tasks" ("project_id", "status")
    `);

    await queryRunner.query(`
      CREATE TABLE "project_task_comments" (
        "id"           uuid NOT NULL DEFAULT uuid_generate_v4(),
        "task_id"      uuid NOT NULL,
        "workspace_id" uuid NOT NULL,
        "content"      text NOT NULL,
        "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_task_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ptc_task" FOREIGN KEY ("task_id")
          REFERENCES "project_tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ptc_workspace" FOREIGN KEY ("workspace_id")
          REFERENCES "workspaces"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_project_task_comments_task" ON "project_task_comments" ("task_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_project_task_comments_task"`);
    await queryRunner.query(`DROP TABLE "project_task_comments"`);
    await queryRunner.query(`DROP INDEX "IDX_project_tasks_project_status"`);
    await queryRunner.query(`DROP TABLE "project_tasks"`);
    await queryRunner.query(`DROP TYPE "public"."project_tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."project_tasks_status_enum"`);
  }
}
