-- AlterEnum: Add PAID to LiquidationStatus
ALTER TYPE "LiquidationStatus" ADD VALUE 'PAID';

-- AlterTable: Add incomeReceiver and paidAt to liquidations
-- No DEFAULT so existing rows get NULL (resolved at runtime from billing config)
ALTER TABLE "liquidations" ADD COLUMN IF NOT EXISTS "incomeReceiver" TEXT;
ALTER TABLE "liquidations" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

-- Reset any existing rows that might have been set to MANAGER by a previous migration
UPDATE "liquidations" SET "incomeReceiver" = NULL WHERE "incomeReceiver" = 'MANAGER';
