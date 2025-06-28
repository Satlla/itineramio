-- Migration: Add essential templates support fields
-- Run this in your PostgreSQL database

BEGIN;

-- Add fields to Zone table for template support
ALTER TABLE "Zone" ADD COLUMN IF NOT EXISTS "isSystemTemplate" BOOLEAN DEFAULT FALSE;

-- Add fields to Step table for template variables
ALTER TABLE "Step" ADD COLUMN IF NOT EXISTS "templateVariables" TEXT[];

-- Add indexes for better performance on template queries
CREATE INDEX IF NOT EXISTS "Zone_isSystemTemplate_idx" ON "Zone"("isSystemTemplate");
CREATE INDEX IF NOT EXISTS "Zone_propertyId_isSystemTemplate_idx" ON "Zone"("propertyId", "isSystemTemplate");

-- Add comment for documentation
COMMENT ON COLUMN "Zone"."isSystemTemplate" IS 'Indicates if this zone was created from a system template';
COMMENT ON COLUMN "Step"."templateVariables" IS 'Array of template variables that users can customize (e.g. {wifi_password})';

COMMIT;

-- Verify the migration
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Zone' AND column_name IN ('isSystemTemplate');

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Step' AND column_name IN ('templateVariables');