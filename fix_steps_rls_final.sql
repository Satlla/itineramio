-- Create a more permissive RLS policy for steps for debugging
DROP POLICY IF EXISTS "Users can view steps of own zones - debug" ON steps;

CREATE POLICY "Users can view steps of own zones - debug" ON steps
FOR SELECT USING (
  -- Allow if user owns the property containing the zone
  EXISTS (
    SELECT 1 FROM zones z
    JOIN properties p ON z."propertyId" = p.id
    WHERE z.id = steps."zoneId" 
    AND p."hostId" = COALESCE(
      current_setting('app.current_user_id', true), 
      (auth.uid())::text
    )
  )
  OR
  -- Also allow if the zone is published (fallback)
  EXISTS (
    SELECT 1 FROM zones z
    WHERE z.id = steps."zoneId" 
    AND z."isPublished" = true
  )
);

-- Update any steps with NULL order to have order = 0
UPDATE steps SET "order" = 0 WHERE "order" IS NULL;

-- Make sure the order field has a proper default
ALTER TABLE steps ALTER COLUMN "order" SET DEFAULT 0;