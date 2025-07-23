-- Check RLS status for all tables in public schema
-- This query will show which tables have RLS enabled/disabled

SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED - SECURITY RISK!'
    END as rls_status,
    CASE 
        WHEN rowsecurity = false THEN 'ALTER TABLE ' || schemaname || '.' || tablename || ' ENABLE ROW LEVEL SECURITY;'
        ELSE 'RLS already enabled'
    END as fix_command
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY 
    rowsecurity ASC,  -- Show disabled first
    tablename ASC;

-- Check existing policies for each table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as policy_condition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Specific check for potentially sensitive tables without RLS
SELECT 
    'WARNING: Table ' || tablename || ' contains potentially sensitive data but RLS is DISABLED!' as security_warning
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
AND tablename IN (
    'users',
    'properties', 
    'zones',
    'steps',
    'reviews',
    'zone_ratings',
    'zone_comments',
    'error_reports',
    'tracking_events',
    'property_analytics',
    'zone_analytics',
    'media_library',
    'invoices',
    'user_subscriptions',
    'notifications'
);