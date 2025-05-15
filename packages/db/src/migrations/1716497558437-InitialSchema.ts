import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1716497558437 implements MigrationInterface {
    name = 'InitialSchema1716497558437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types
        await queryRunner.query(`
            CREATE TYPE "public"."garden_members_role_enum" AS ENUM('owner', 'member')
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."plots_stage_enum" AS ENUM('empty', 'seed', 'sprout', 'mature', 'harvest')
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."star_transactions_type_enum" AS ENUM('purchase', 'refund', 'payout', 'gift')
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tgId" character varying NOT NULL,
                "username" character varying,
                "firstName" character varying,
                "lastName" character varying,
                "level" integer NOT NULL DEFAULT 1,
                "xp" integer NOT NULL DEFAULT 0,
                "coins" integer NOT NULL DEFAULT 100,
                "stars" integer NOT NULL DEFAULT 0,
                "referrerId" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_76ba283779c8441fd5ff819c871" UNIQUE ("tgId"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        // Create gardens table
        await queryRunner.query(`
            CREATE TABLE "gardens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "ownerId" uuid NOT NULL,
                "width" integer NOT NULL DEFAULT 6,
                "height" integer NOT NULL DEFAULT 15,
                "hasDog" boolean NOT NULL DEFAULT false,
                "dogFedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_789f5e90c1e9a035c531b493cc1" PRIMARY KEY ("id")
            )
        `);

        // Create garden_members table
        await queryRunner.query(`
            CREATE TABLE "garden_members" (
                "userId" uuid NOT NULL,
                "gardenId" uuid NOT NULL,
                "role" "public"."garden_members_role_enum" NOT NULL DEFAULT 'member',
                "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e9b37423fd299524899bf9d2308" PRIMARY KEY ("userId", "gardenId")
            )
        `);

        // Create plots table
        await queryRunner.query(`
            CREATE TABLE "plots" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "gardenId" uuid NOT NULL,
                "x" integer NOT NULL,
                "y" integer NOT NULL,
                "plantId" character varying,
                "stage" "public"."plots_stage_enum" NOT NULL DEFAULT 'empty',
                "plantedAt" TIMESTAMP,
                "lastWateredAt" TIMESTAMP,
                "pest" boolean NOT NULL DEFAULT false,
                "stolePercent" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ea60d0701a5753f7ebdf61527b7" PRIMARY KEY ("id")
            )
        `);

        // Create trees table
        await queryRunner.query(`
            CREATE TABLE "trees" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "gardenId" uuid NOT NULL,
                "treeType" character varying NOT NULL,
                "x" integer NOT NULL,
                "y" integer NOT NULL,
                "plantedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "lastHarvestAt" TIMESTAMP,
                "expiresAt" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_eba8570a2815379e536eaf5bf54" PRIMARY KEY ("id")
            )
        `);

        // Create animals table
        await queryRunner.query(`
            CREATE TABLE "animals" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "gardenId" uuid NOT NULL,
                "animalType" character varying NOT NULL,
                "x" integer NOT NULL,
                "y" integer NOT NULL,
                "fedAt" TIMESTAMP,
                "lastCollectAt" TIMESTAMP,
                "isPremium" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_3f86a6919de5cec95fa90ff2191" PRIMARY KEY ("id")
            )
        `);

        // Create buildings table
        await queryRunner.query(`
            CREATE TABLE "buildings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "gardenId" uuid NOT NULL,
                "type" character varying NOT NULL,
                "level" integer NOT NULL DEFAULT 1,
                "x" integer NOT NULL,
                "y" integer NOT NULL,
                "data" jsonb,
                "lastUsedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_3115d85010595af5e8485e31e37" PRIMARY KEY ("id")
            )
        `);

        // Create quest_progress table
        await queryRunner.query(`
            CREATE TABLE "quest_progress" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "questId" character varying NOT NULL,
                "progress" integer NOT NULL DEFAULT 0,
                "completed" boolean NOT NULL DEFAULT false,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b4666a8f781a761878f1d9ba7b4" PRIMARY KEY ("id")
            )
        `);

        // Create invite_bonuses table
        await queryRunner.query(`
            CREATE TABLE "invite_bonuses" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "multiplier" integer NOT NULL DEFAULT 2,
                "expiresAt" TIMESTAMP NOT NULL,
                "reason" character varying,
                "isConsumed" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_9cfe4a1e14a3e73c824931fb9aa" PRIMARY KEY ("id")
            )
        `);

        // Create star_transactions table
        await queryRunner.query(`
            CREATE TABLE "star_transactions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "stars" integer NOT NULL,
                "usd" numeric(10,2) NOT NULL,
                "type" "public"."star_transactions_type_enum" NOT NULL DEFAULT 'purchase',
                "payloadJson" jsonb,
                "invoiceId" character varying,
                "isProcessed" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b19aa2dfc3c0a689d7a42de7686" PRIMARY KEY ("id")
            )
        `);

        // Create purchases table
        await queryRunner.query(`
            CREATE TABLE "purchases" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "skuId" character varying NOT NULL,
                "stars" integer NOT NULL,
                "delivered" boolean NOT NULL DEFAULT false,
                "metadata" jsonb,
                "expiresAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1d55032f37a34c6eceacb7f4e14" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "gardens" 
            ADD CONSTRAINT "FK_dc3af4751fcd6d33f1c7d8b0070" 
            FOREIGN KEY ("ownerId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "garden_members" 
            ADD CONSTRAINT "FK_4cd107e88a2e19ca1c28a3e553a" 
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "garden_members" 
            ADD CONSTRAINT "FK_1d03477cb0afecab07590e4f966" 
            FOREIGN KEY ("gardenId") 
            REFERENCES "gardens"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "plots" 
            ADD CONSTRAINT "FK_1acd63ea78c742a7e0cc397d149" 
            FOREIGN KEY ("gardenId") 
            REFERENCES "gardens"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "trees" 
            ADD CONSTRAINT "FK_9ca4a34499a6f2b7d489e201ccc" 
            FOREIGN KEY ("gardenId") 
            REFERENCES "gardens"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "animals" 
            ADD CONSTRAINT "FK_d79e9a3f10dec53020a33a0d488" 
            FOREIGN KEY ("gardenId") 
            REFERENCES "gardens"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "buildings" 
            ADD CONSTRAINT "FK_8c6c7d581fece4fd3ec3d12bf45" 
            FOREIGN KEY ("gardenId") 
            REFERENCES "gardens"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "quest_progress" 
            ADD CONSTRAINT "FK_baa54e53a2bfb9d6d01dfa45d49" 
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "invite_bonuses" 
            ADD CONSTRAINT "FK_5759c2fc95f776e701499d4cbcd" 
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "star_transactions" 
            ADD CONSTRAINT "FK_902766cf4cc2e0464e5c311a591" 
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "purchases" 
            ADD CONSTRAINT "FK_6d6372556bb3f55ef29227e6945" 
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        // Add uuid-ossp extension for UUID generation
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Add indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_users_tgId" ON "users" ("tgId")`);
        await queryRunner.query(`CREATE INDEX "IDX_garden_ownerId" ON "gardens" ("ownerId")`);
        await queryRunner.query(`CREATE INDEX "IDX_plots_gardenId" ON "plots" ("gardenId")`);
        await queryRunner.query(`CREATE INDEX "IDX_plots_coords" ON "plots" ("gardenId", "x", "y")`);
        await queryRunner.query(`CREATE INDEX "IDX_quest_progress_user_quest" ON "quest_progress" ("userId", "questId")`);
        await queryRunner.query(`CREATE INDEX "IDX_invite_bonuses_userId" ON "invite_bonuses" ("userId", "expiresAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_star_transactions_userId" ON "star_transactions" ("userId", "createdAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_purchases_userId_skuId" ON "purchases" ("userId", "skuId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT "FK_6d6372556bb3f55ef29227e6945"`);
        await queryRunner.query(`ALTER TABLE "star_transactions" DROP CONSTRAINT "FK_902766cf4cc2e0464e5c311a591"`);
        await queryRunner.query(`ALTER TABLE "invite_bonuses" DROP CONSTRAINT "FK_5759c2fc95f776e701499d4cbcd"`);
        await queryRunner.query(`ALTER TABLE "quest_progress" DROP CONSTRAINT "FK_baa54e53a2bfb9d6d01dfa45d49"`);
        await queryRunner.query(`ALTER TABLE "buildings" DROP CONSTRAINT "FK_8c6c7d581fece4fd3ec3d12bf45"`);
        await queryRunner.query(`ALTER TABLE "animals" DROP CONSTRAINT "FK_d79e9a3f10dec53020a33a0d488"`);
        await queryRunner.query(`ALTER TABLE "trees" DROP CONSTRAINT "FK_9ca4a34499a6f2b7d489e201ccc"`);
        await queryRunner.query(`ALTER TABLE "plots" DROP CONSTRAINT "FK_1acd63ea78c742a7e0cc397d149"`);
        await queryRunner.query(`ALTER TABLE "garden_members" DROP CONSTRAINT "FK_1d03477cb0afecab07590e4f966"`);
        await queryRunner.query(`ALTER TABLE "garden_members" DROP CONSTRAINT "FK_4cd107e88a2e19ca1c28a3e553a"`);
        await queryRunner.query(`ALTER TABLE "gardens" DROP CONSTRAINT "FK_dc3af4751fcd6d33f1c7d8b0070"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_purchases_userId_skuId"`);
        await queryRunner.query(`DROP INDEX "IDX_star_transactions_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_invite_bonuses_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_quest_progress_user_quest"`);
        await queryRunner.query(`DROP INDEX "IDX_plots_coords"`);
        await queryRunner.query(`DROP INDEX "IDX_plots_gardenId"`);
        await queryRunner.query(`DROP INDEX "IDX_garden_ownerId"`);
        await queryRunner.query(`DROP INDEX "IDX_users_tgId"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "purchases"`);
        await queryRunner.query(`DROP TABLE "star_transactions"`);
        await queryRunner.query(`DROP TABLE "invite_bonuses"`);
        await queryRunner.query(`DROP TABLE "quest_progress"`);
        await queryRunner.query(`DROP TABLE "buildings"`);
        await queryRunner.query(`DROP TABLE "animals"`);
        await queryRunner.query(`DROP TABLE "trees"`);
        await queryRunner.query(`DROP TABLE "plots"`);
        await queryRunner.query(`DROP TABLE "garden_members"`);
        await queryRunner.query(`DROP TABLE "gardens"`);
        await queryRunner.query(`DROP TABLE "users"`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE "public"."star_transactions_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."plots_stage_enum"`);
        await queryRunner.query(`DROP TYPE "public"."garden_members_role_enum"`);
    }
}
