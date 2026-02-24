-- AlterTable
ALTER TABLE "properties" ADD COLUMN "isDemoPreview" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "properties" ADD COLUMN "demoExpiresAt" TIMESTAMP(3);
ALTER TABLE "properties" ADD COLUMN "demoLeadId" TEXT;
