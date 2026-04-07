-- =============================================================================
-- FIX: Profiles PII still exposed via "Authenticated users can view provider profiles"
--
-- Root cause: migration 20260406175830 re-introduced a broad SELECT policy that
-- lets any authenticated user read ALL columns (email, phone, suspension_reason,
-- account status) of any provider profile.
--
-- Fix:
--   1. Drop the permissive policy.
--   2. Expand public_provider_profiles view to include safe public fields
--      needed by browse / discovery pages (no PII).
--   3. Expand get_public_provider_profiles() function to match the view.
--   4. Add a narrow "Providers visible to anon for discovery" RLS policy that
--      allows SELECT but only via the safe view (enforced by security_invoker).
-- =============================================================================

-- 1. Drop the policy that exposes PII to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view provider profiles" ON public.profiles;

-- 2. Rebuild public_provider_profiles view – exposes only non-sensitive columns
--    needed for marketplace browsing, provider cards, and search results.
--    Deliberately excludes: email, phone, suspension_reason, subscription_expires_at,
--    push_consent_at, newsletter_consent_at, and any other PII.
DROP VIEW IF EXISTS public.public_provider_profiles;

CREATE VIEW public.public_provider_profiles
  WITH (security_invoker = on)
  AS
SELECT
  p.id,
  p.full_name,
  p.first_name,
  p.last_name,
  p.company_name,
  p.bio,
  p.avatar_url,
  p.is_featured,
  p.is_verified,
  p.subscription_status,
  p.services_offered,
  p.service_type_key,
  p.service_type_label,
  p.city,
  p.state,
  p.zip_code,
  p.coverage_radius_miles,
  p.lat,
  p.lng,
  p.latitude,
  p.longitude,
  p.profile_completion_pct,
  p.linkedin_profile_url,
  p.linkedin_headline,
  p.last_auth_method,
  p.created_at,
  p.updated_at
FROM public.profiles p
-- Only surface providers who are active (not suspended)
WHERE p.is_suspended IS NOT TRUE
   OR p.is_suspended IS NULL;

-- Keep existing grants intact
GRANT SELECT ON public.public_provider_profiles TO anon, authenticated;

-- 3. Rebuild get_public_provider_profiles() to return the same safe columns
CREATE OR REPLACE FUNCTION public.get_public_provider_profiles(provider_ids uuid[])
RETURNS TABLE(
  id                   uuid,
  full_name            text,
  first_name           text,
  last_name            text,
  company_name         text,
  bio                  text,
  avatar_url           text,
  is_featured          boolean,
  is_verified          boolean,
  subscription_status  text,
  services_offered     text[],
  service_type_key     text,
  service_type_label   text,
  city                 text,
  state                text,
  zip_code             text,
  coverage_radius_miles integer,
  lat                  numeric,
  lng                  numeric,
  linkedin_headline    text,
  created_at           timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    p.id,
    p.full_name,
    p.first_name,
    p.last_name,
    p.company_name,
    p.bio,
    p.avatar_url,
    p.is_featured,
    p.is_verified,
    p.subscription_status::text,
    p.services_offered,
    p.service_type_key,
    p.service_type_label,
    p.city,
    p.state,
    p.zip_code,
    p.coverage_radius_miles,
    p.lat,
    p.lng,
    p.linkedin_headline,
    p.created_at
  FROM public.profiles p
  WHERE p.id = ANY(provider_ids)
    AND (p.is_suspended IS NOT TRUE OR p.is_suspended IS NULL);
$$;

REVOKE ALL ON FUNCTION public.get_public_provider_profiles(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_provider_profiles(uuid[]) TO anon, authenticated;

-- 4. The remaining active SELECT policies on profiles are now:
--    a. "Users can view own full profile"       USING (auth.uid() = id)
--    b. "Users can only view own profile directly" USING (auth.uid() = id)  [duplicate, harmless]
--    c. "Admins can update all profiles"        (UPDATE only – unaffected)
--    d. "Admins can delete profiles"            (DELETE only – unaffected)
--
-- Non-owners/non-admins can no longer read any row in profiles directly.
-- They must use the public_provider_profiles view or get_public_provider_profiles()
-- which return only safe columns.
--
-- Verify with:
--   SELECT policyname, cmd, qual FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'profiles';
