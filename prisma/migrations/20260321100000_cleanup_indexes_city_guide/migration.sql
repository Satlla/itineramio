-- Add performance index on reservations for platform+date queries
CREATE INDEX IF NOT EXISTS "reservations_userId_platform_checkIn_idx" ON "reservations"("userId", "platform", "checkIn");

-- Update unique constraint on city_guide_places to allow same place in different categories
-- Drop old constraint (guideId, placeId) and replace with (guideId, placeId, category)
DROP INDEX IF EXISTS "city_guide_places_guideId_placeId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "city_guide_places_guideId_placeId_category_key" ON "city_guide_places"("guideId", "placeId", "category");
