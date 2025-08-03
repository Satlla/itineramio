-- Update all steps that don't have an order value
UPDATE steps 
SET "order" = 0 
WHERE "order" IS NULL;

-- Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_steps_zone_order ON steps("zoneId", "order");
CREATE INDEX IF NOT EXISTS idx_steps_zone_id ON steps("zoneId", "id");