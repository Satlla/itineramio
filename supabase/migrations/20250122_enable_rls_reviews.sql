-- Enable RLS on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view public reviews" ON public.reviews;
DROP POLICY IF EXISTS "Hosts can view all reviews for their properties" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Hosts can update their property reviews" ON public.reviews;
DROP POLICY IF EXISTS "Hosts can delete their property reviews" ON public.reviews;

-- Policy 1: Public can view only approved public reviews
CREATE POLICY "Public can view public reviews"
ON public.reviews
FOR SELECT
USING (
  "isPublic" = true 
  AND "isApproved" = true
);

-- Policy 2: Property hosts can view ALL reviews for their properties (public and private)
CREATE POLICY "Hosts can view all reviews for their properties"
ON public.reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = reviews."propertyId"
    AND p."hostId" = auth.uid()::text
  )
);

-- Policy 3: Anyone can create reviews (guests can leave reviews)
CREATE POLICY "Anyone can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- Policy 4: Hosts can update reviews for their properties (to approve/disapprove, add responses)
CREATE POLICY "Hosts can update their property reviews"
ON public.reviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = reviews."propertyId"
    AND p."hostId" = auth.uid()::text
  )
);

-- Policy 5: Only hosts can delete reviews for their properties
CREATE POLICY "Hosts can delete their property reviews"
ON public.reviews
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = reviews."propertyId"
    AND p."hostId" = auth.uid()::text
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_property_public ON public.reviews("propertyId", "isPublic", "isApproved");
CREATE INDEX IF NOT EXISTS idx_reviews_zone ON public.reviews("zoneId") WHERE "zoneId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews("createdAt");

-- Grant necessary permissions
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

-- Add comment explaining the security model
COMMENT ON TABLE public.reviews IS 'Reviews/ratings for properties and zones. RLS enabled with policies for public viewing of approved reviews and host management.';