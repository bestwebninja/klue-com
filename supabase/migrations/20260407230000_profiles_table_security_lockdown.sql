-- =============================================================================
-- PROFILES TABLE SECURITY LOCKDOWN
--
-- Purpose:
--   Fully remove permissive profiles SELECT policies that can expose PII,
--   enforce owner-only direct reads on public.profiles, and keep provider
--   discovery restricted to the safe public view/function surface.
-- =============================================================================

-- 1) Remove known permissive SELECT policies (legacy + recent variants)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view provider profiles" ON public.profiles;

-- 2) Deduplicate owner-read policies and enforce one canonical owner-only policy
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only view own profile directly" ON public.profiles;

CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3) Ensure the public provider view is definer-secured and column-safe.
--    (Do not use security_invoker here; callers should not need direct access
--     to profiles and must only see this curated column list.)
DROP VIEW IF EXISTS public.public_provider_profiles;

CREATE VIEW public.public_provider_profiles AS
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
WHERE p.is_suspended IS NOT TRUE;

GRANT SELECT ON public.public_provider_profiles TO anon, authenticated;

-- 4) Keep helper RPC public and constrained to the same safe records.
CREATE OR REPLACE FUNCTION public.get_public_provider_profiles(provider_ids uuid[])
RETURNS TABLE(
  id uuid,
  full_name text,
  first_name text,
  last_name text,
  company_name text,
  bio text,
  avatar_url text,
  is_featured boolean,
  is_verified boolean,
  subscription_status text,
  services_offered text[],
  service_type_key text,
  service_type_label text,
  city text,
  state text,
  zip_code text,
  coverage_radius_miles integer,
  lat numeric,
  lng numeric,
  linkedin_headline text,
  created_at timestamptz
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
    AND p.is_suspended IS NOT TRUE;
$$;

REVOKE ALL ON FUNCTION public.get_public_provider_profiles(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_provider_profiles(uuid[]) TO anon, authenticated;
