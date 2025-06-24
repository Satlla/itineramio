-- =================================================
-- ITINERAMIO - SUPABASE RLS SECURITY FIX
-- This script enables Row Level Security (RLS) on all tables
-- and creates appropriate security policies
-- =================================================

-- Enable RLS on all public tables
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inspiration_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
-- Media library table doesn't exist yet, skip RLS for now
-- ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- =================================================
-- CREATE HELPER FUNCTIONS FOR JWT AUTHENTICATION
-- =================================================

-- Function to get current user ID from JWT claims
CREATE OR REPLACE FUNCTION current_user_id() RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'userId',
    current_setting('app.current_user_id', true)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =================================================
-- CREATE RLS POLICIES FOR USER DATA
-- =================================================

-- Users table: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (current_user_id() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (current_user_id() = id);

-- Properties: Users can only access their own properties
CREATE POLICY "Users can view own properties" ON public.properties
    FOR SELECT USING (current_user_id() = "hostId");

CREATE POLICY "Users can insert own properties" ON public.properties
    FOR INSERT WITH CHECK (current_user_id() = "hostId");

CREATE POLICY "Users can update own properties" ON public.properties
    FOR UPDATE USING (current_user_id() = "hostId");

CREATE POLICY "Users can delete own properties" ON public.properties
    FOR DELETE USING (current_user_id() = "hostId");

-- Property sets: Users can only access their own property sets
CREATE POLICY "Users can view own property sets" ON public.property_sets
    FOR SELECT USING (current_user_id() = "hostId");

CREATE POLICY "Users can insert own property sets" ON public.property_sets
    FOR INSERT WITH CHECK (current_user_id() = "hostId");

CREATE POLICY "Users can update own property sets" ON public.property_sets
    FOR UPDATE USING (current_user_id() = "hostId");

CREATE POLICY "Users can delete own property sets" ON public.property_sets
    FOR DELETE USING (current_user_id() = "hostId");

-- Zones: Users can access zones of their properties
CREATE POLICY "Users can view zones of own properties" ON public.zones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = zones."propertyId" 
            AND properties."hostId" = current_user_id()
        )
    );

CREATE POLICY "Users can insert zones to own properties" ON public.zones
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = zones."propertyId" 
            AND properties."hostId" = current_user_id()
        )
    );

CREATE POLICY "Users can update zones of own properties" ON public.zones
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = zones."propertyId" 
            AND properties."hostId" = current_user_id()
        )
    );

CREATE POLICY "Users can delete zones of own properties" ON public.zones
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = zones."propertyId" 
            AND properties."hostId" = current_user_id()
        )
    );

-- Steps: Users can access steps of their zones
CREATE POLICY "Users can view steps of own zones" ON public.steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.zones 
            JOIN public.properties ON properties.id = zones."propertyId"
            WHERE zones.id = steps."zoneId" 
            AND properties."hostId" = current_user_id()
        )
    );

CREATE POLICY "Users can insert steps to own zones" ON public.steps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.zones 
            JOIN public.properties ON properties.id = zones."propertyId"
            WHERE zones.id = steps."zoneId" 
            AND properties."hostId" = current_user_id()
        )
    );

CREATE POLICY "Users can update steps of own zones" ON public.steps
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.zones 
            JOIN public.properties ON properties.id = zones."propertyId"
            WHERE zones.id = steps."zoneId" 
            AND properties."hostId" = current_user_id()
        )
    );

CREATE POLICY "Users can delete steps of own zones" ON public.steps
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.zones 
            JOIN public.properties ON properties.id = zones."propertyId"
            WHERE zones.id = steps."zoneId" 
            AND properties."hostId" = current_user_id()
        )
    );

-- Media Library: Users can only access their own media (table doesn't exist yet)
-- CREATE POLICY "Users can view own media" ON public.media_library
--     FOR SELECT USING (current_user_id() = "userId");

-- CREATE POLICY "Users can insert own media" ON public.media_library
--     FOR INSERT WITH CHECK (current_user_id() = "userId");

-- CREATE POLICY "Users can update own media" ON public.media_library
--     FOR UPDATE USING (current_user_id() = "userId");

-- CREATE POLICY "Users can delete own media" ON public.media_library
--     FOR DELETE USING (current_user_id() = "userId");

-- Property Analytics: Users can view analytics of their properties
CREATE POLICY "Users can view analytics of own properties" ON public.property_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE properties.id = property_analytics."propertyId" 
            AND properties."hostId" = current_user_id()
        )
    );

-- User subscriptions: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (current_user_id() = user_id);

-- User inspiration states: Users can manage their own inspiration state
CREATE POLICY "Users can view own inspiration state" ON public.user_inspiration_states
    FOR SELECT USING (current_user_id() = "userId");

CREATE POLICY "Users can update own inspiration state" ON public.user_inspiration_states
    FOR UPDATE USING (current_user_id() = "userId");

CREATE POLICY "Users can insert own inspiration state" ON public.user_inspiration_states
    FOR INSERT WITH CHECK (current_user_id() = "userId");

-- Email verification tokens: Users can access their own tokens
CREATE POLICY "Users can view own email tokens" ON public.email_verification_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = current_user_id() 
            AND users.email = email_verification_tokens.email
        )
    );

-- =================================================
-- PUBLIC READ-ONLY POLICIES (for guest access)
-- =================================================

-- Zones: Allow public read access via QR codes (for guests)
CREATE POLICY "Public can view published zones" ON public.zones
    FOR SELECT USING ("isPublished" = true);

-- Steps: Allow public read access for published zones
CREATE POLICY "Public can view steps of published zones" ON public.steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.zones 
            WHERE zones.id = steps."zoneId" 
            AND zones."isPublished" = true
        )
    );

-- Properties: Allow limited public read for published properties
CREATE POLICY "Public can view published properties" ON public.properties
    FOR SELECT USING ("isPublished" = true);

-- Zone comments: Public can view approved comments
CREATE POLICY "Public can view approved comments" ON public.zone_comments
    FOR SELECT USING (status = 'APPROVED');

-- Zone ratings: Public can view ratings
CREATE POLICY "Public can view zone ratings" ON public.zone_ratings
    FOR ALL USING (true);

-- =================================================
-- ADMIN POLICIES
-- =================================================

-- System settings: Only admins can access
CREATE POLICY "Only admins can access system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = current_user_id() 
            AND users."isAdmin" = true
        )
    );

-- Admin activity log: Only admins can access
CREATE POLICY "Only admins can access activity log" ON public.admin_activity_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = current_user_id() 
            AND users."isAdmin" = true
        )
    );

-- Subscription plans: Public read, admin write
CREATE POLICY "Public can view subscription plans" ON public.subscription_plans
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify subscription plans" ON public.subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = current_user_id() 
            AND users."isAdmin" = true
        )
    );

-- Daily stats: Admin only
CREATE POLICY "Only admins can access daily stats" ON public.daily_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = current_user_id() 
            AND users."isAdmin" = true
        )
    );

-- Invoices: Users can view their own, admins can view all
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT USING (current_user_id() = user_id);

CREATE POLICY "Admins can manage all invoices" ON public.invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = current_user_id() 
            AND users."isAdmin" = true
        )
    );

-- Error reports: Users can create, admins can manage
CREATE POLICY "Anyone can create error reports" ON public.error_reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage error reports" ON public.error_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = current_user_id() 
            AND users."isAdmin" = true
        )
    );

-- Organizations: Members can access
CREATE POLICY "Organization members can access" ON public.organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members."organizationId" = organizations.id 
            AND organization_members."userId" = current_user_id()
        )
    );

-- Organization members: Members can view, admins can manage
CREATE POLICY "Members can view organization members" ON public.organization_members
    FOR SELECT USING (current_user_id() = "userId");

-- Buildings: Organization members can access
CREATE POLICY "Organization members can access buildings" ON public.buildings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members."organizationId" = buildings."organizationId" 
            AND organization_members."userId" = current_user_id()
        )
    );

-- =================================================
-- GRANT NECESSARY PERMISSIONS
-- =================================================

-- Ensure authenticated users can access their own data
-- Note: Using 'public' role as 'authenticated' role doesn't exist in this setup
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO public;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

-- =================================================
-- END OF RLS SECURITY FIX
-- =================================================

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    policies.policy_count
FROM pg_tables 
LEFT JOIN (
    SELECT schemaname, tablename, COUNT(*) as policy_count
    FROM pg_policies 
    GROUP BY schemaname, tablename
) policies USING (schemaname, tablename)
WHERE schemaname = 'public'
ORDER BY tablename;