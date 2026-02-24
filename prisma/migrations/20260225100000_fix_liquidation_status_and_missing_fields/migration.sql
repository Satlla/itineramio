-- Step 1: Fix LiquidationStatus enum (PENDING → SENT, remove PAID)
-- First add SENT as a new valid value
ALTER TYPE "LiquidationStatus" ADD VALUE IF NOT EXISTS 'SENT';

-- Commit enum change (needed in PostgreSQL before using new value)
-- Note: ADD VALUE cannot run inside a transaction block in older PG versions,
-- but Prisma runs each migration file as a single transaction.
-- We use a workaround: rename old enum, create new one, migrate column.

-- Step 2: Update any existing rows that use PENDING → SENT
UPDATE "liquidations" SET "status" = 'SENT' WHERE "status" = 'PENDING';

-- Step 3: Recreate enum without PENDING and PAID
-- (PostgreSQL doesn't support DROP VALUE from enum, so we recreate it)
ALTER TYPE "LiquidationStatus" RENAME TO "LiquidationStatus_old";
CREATE TYPE "LiquidationStatus" AS ENUM ('DRAFT', 'SENT', 'CANCELLED');
ALTER TABLE "liquidations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "liquidations" ALTER COLUMN "status" TYPE "LiquidationStatus" USING ("status"::text::"LiquidationStatus");
ALTER TABLE "liquidations" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
DROP TYPE "LiquidationStatus_old";

-- Step 4: Add retentionRate to property_owners (nullable Decimal(5,2))
ALTER TABLE "property_owners" ADD COLUMN IF NOT EXISTS "retentionRate" DECIMAL(5,2);

-- Step 5: Create DirectionsCache table
CREATE TABLE IF NOT EXISTS "directions_cache" (
    "id" TEXT NOT NULL,
    "originQuery" TEXT NOT NULL,
    "destTileKey" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "lastFetchedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "directions_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "directions_cache_originQuery_destTileKey_mode_key" ON "directions_cache"("originQuery", "destTileKey", "mode");
