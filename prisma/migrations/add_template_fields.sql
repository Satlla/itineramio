-- Add fields to support essential templates
ALTER TABLE "Zone" ADD COLUMN IF NOT EXISTS "isSystemTemplate" BOOLEAN DEFAULT FALSE;
ALTER TABLE "Step" ADD COLUMN IF NOT EXISTS "templateVariables" TEXT[];

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "Zone_isSystemTemplate_idx" ON "Zone"("isSystemTemplate");
CREATE INDEX IF NOT EXISTS "Zone_propertyId_isSystemTemplate_idx" ON "Zone"("propertyId", "isSystemTemplate");