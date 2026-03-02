-- Performance indexes for dashboard queries

-- Property: queries by hostId with soft-delete filter
CREATE INDEX IF NOT EXISTS "properties_hostId_deletedAt_idx" ON "properties"("hostId", "deletedAt");

-- Notification: queries by userId + type + createdAt (navbar filters by type)
CREATE INDEX IF NOT EXISTS "notifications_userId_type_createdAt_idx" ON "notifications"("userId", "type", "createdAt");

-- PropertySet: queries by hostId (dashboard loads sets)
CREATE INDEX IF NOT EXISTS "property_sets_hostId_idx" ON "property_sets"("hostId");
