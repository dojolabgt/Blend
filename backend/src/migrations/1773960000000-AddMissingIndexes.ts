import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingIndexes1773960000000 implements MigrationInterface {
  name = 'AddMissingIndexes1773960000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // deals: status filter + createdAt ordering
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_deals_status" ON "deals" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_deals_created_at" ON "deals" ("createdAt")`,
    );

    // FK columns that PostgreSQL does NOT index automatically
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payment_milestones_plan_id" ON "payment_milestones" ("payment_plan_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_quotation_items_quotation_id" ON "quotation_items" ("quotation_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_milestone_splits_milestone_id" ON "milestone_splits" ("milestone_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_milestone_splits_milestone_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_quotation_items_quotation_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_payment_milestones_plan_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_deals_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_deals_status"`);
  }
}
