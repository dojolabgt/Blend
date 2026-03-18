import { MigrationInterface, QueryRunner } from "typeorm";

export class PendingSchemaChanges1773900000000 implements MigrationInterface {
    name = 'PendingSchemaChanges1773900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "client_portal_invites" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" uuid NOT NULL,
                "token" character varying NOT NULL,
                "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "usedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_782b53c7d3d82220f17719ca95b" UNIQUE ("token"),
                CONSTRAINT "PK_783c3c6493ab37bd241b39bbad0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_039261f18f554b5935e58361f6" ON "client_portal_invites" ("client_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_782b53c7d3d82220f17719ca95" ON "client_portal_invites" ("token")`);
        await queryRunner.query(`
            ALTER TABLE "client_portal_invites"
            ADD CONSTRAINT "FK_039261f18f554b5935e58361f67"
            FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_portal_invites" DROP CONSTRAINT "FK_039261f18f554b5935e58361f67"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "client_portal_invites"`);
    }

}
