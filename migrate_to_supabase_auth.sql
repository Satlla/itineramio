-- =================================================
-- MIGRATE TO SUPABASE AUTH
-- This script creates auth.users entries for existing users
-- =================================================

-- First, let's see what users we have
SELECT id, email, name, "emailVerified", "isActive" FROM public.users LIMIT 10;

-- Create corresponding auth.users entries
-- Note: This needs to be done through Supabase Admin API or Dashboard
-- because auth.users is managed by Supabase Auth service

-- For now, let's create a function to sync user data
CREATE OR REPLACE FUNCTION sync_user_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called when auth.users is created
  -- to automatically create corresponding public.users entry
  
  INSERT INTO public.users (
    id,
    email,
    name,
    "emailVerified",
    "createdAt",
    "updatedAt"
  ) VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN NEW.email_confirmed_at ELSE NULL END,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    "emailVerified" = EXCLUDED."emailVerified",
    "updatedAt" = EXCLUDED."updatedAt";
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_to_auth();

-- Update RLS policies to work with Supabase Auth
-- The auth.uid() function will now return proper UUIDs from auth.users

-- Add admin detection function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid()::text 
    AND "isAdmin" = true 
    AND "isActive" = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;