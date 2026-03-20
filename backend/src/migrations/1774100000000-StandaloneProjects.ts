import { MigrationInterface, QueryRunner } from 'typeorm';

export class StandaloneProjects1774100000000 implements MigrationInterface {
  name = 'StandaloneProjects1774100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Make deal_id nullable on projects ─────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "projects" ALTER COLUMN "deal_id" DROP NOT NULL`,
    );

    // ── 2. Add direct client_id to projects ──────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "client_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_client_id"
       FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL`,
    );

    // ── 3. Add metadata columns to projects ───────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "currency" varchar(10)`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "budget" decimal(12,2)`,
    );

    // ── 4. Create project_briefs table ────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "project_briefs" (
        "id"                uuid DEFAULT uuid_generate_v4() NOT NULL,
        "project_id"        uuid NOT NULL,
        "name"              varchar NOT NULL,
        "template_id"       uuid,
        "template_snapshot" jsonb DEFAULT '[]',
        "responses"         jsonb DEFAULT '{}',
        "is_completed"      boolean NOT NULL DEFAULT false,
        "sort_order"        integer NOT NULL DEFAULT 0,
        "created_at"        TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_briefs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_briefs_project"
          FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_briefs_template"
          FOREIGN KEY ("template_id") REFERENCES "brief_templates"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_project_briefs_project_id"
       ON "project_briefs" ("project_id")`,
    );

    // ── 5. Make deal_id nullable on payment_plans ─────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "payment_plans" ALTER COLUMN "deal_id" DROP NOT NULL`,
    );

    // ── 6. Add project_id to payment_plans ────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "payment_plans" ADD COLUMN IF NOT EXISTS "project_id" uuid UNIQUE`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_plans" ADD CONSTRAINT "FK_payment_plans_project_id"
       FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE`,
    );

    // ── 7. Add Stripe placeholder columns to payment_plans ────────────────────
    await queryRunner.query(
      `ALTER TABLE "payment_plans" ADD COLUMN IF NOT EXISTS "billing_cycle" varchar(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_plans" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_plans" ADD COLUMN IF NOT EXISTS "stripe_price_id" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_plans" ADD COLUMN IF NOT EXISTS "stripe_payment_method_id" varchar`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payment_plans_project_id"
       ON "payment_plans" ("project_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_payment_plans_project_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_project_briefs_project_id"`);
    await queryRunner.query(
      `ALTER TABLE "payment_plans" DROP COLUMN IF EXISTS "stripe_payment_method_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_plans" DROP COLUMN IF EXISTS "stripe_price_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_plans" DROP COLUMN IF EXISTS "stripe_subscription_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_plans" DROP COLUMN IF EXISTS "billing_cycle"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_plans" DROP CONSTRAINT IF EXISTS "FK_payment_plans_project_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_plans" DROP COLUMN IF EXISTS "project_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "project_briefs"`);
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN IF EXISTS "budget"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN IF EXISTS "currency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN IF EXISTS "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "FK_projects_client_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN IF EXISTS "client_id"`,
    );
    // Note: not reverting deal_id NOT NULL to avoid breaking existing data
  }
}
