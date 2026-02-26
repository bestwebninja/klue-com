-- Remove the overly permissive policy that exposes all profile fields
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- The existing policies that remain are:
-- 1. "Users can view own full profile" - USING (auth.uid() = id) - users see their own data
-- 2. "Admins can update all profiles" - admin access
-- 3. "Users can update own profile" - users can update their own
-- 4. "Users can insert own profile" - users can create their own
-- 5. "Admins can delete profiles" - admin access

-- For provider discovery, the application should use the public_provider_profiles view
-- which only exposes non-sensitive fields (id, full_name, bio, avatar_url, is_featured, is_verified, created_at)