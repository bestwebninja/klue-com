-- Revoke SELECT privilege from anon role on profiles table
-- This ensures anonymous users cannot access sensitive profile data even if RLS is misconfigured
REVOKE SELECT ON public.profiles FROM anon;

-- Keep SELECT for authenticated users (they can still only see their own due to RLS)
-- This is already granted by default, but explicitly confirming

-- Also revoke from anon on provider_locations (contains address info)
REVOKE SELECT ON public.provider_locations FROM anon;

-- Ensure the public views are still accessible to anon for sanitized public data
GRANT SELECT ON public.public_provider_profiles TO anon, authenticated;
GRANT SELECT ON public.public_provider_locations TO anon, authenticated;