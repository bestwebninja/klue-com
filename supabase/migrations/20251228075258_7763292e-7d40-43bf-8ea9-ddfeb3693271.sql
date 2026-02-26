-- Recreate public_expert_questions view with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_expert_questions;
CREATE VIEW public.public_expert_questions
    WITH (security_invoker=on)
    AS
SELECT 
  id,
  title,
  content,
  category_id,
  created_at,
  updated_at,
  -- Only show user_id to the question author themselves
  CASE 
    WHEN auth.uid() = user_id THEN user_id
    ELSE NULL
  END as user_id
FROM public.expert_questions;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_expert_questions TO authenticated, anon;

-- Recreate public_job_listings view with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_job_listings;
CREATE VIEW public.public_job_listings
    WITH (security_invoker=on)
    AS
SELECT 
  id,
  title,
  description,
  category_id,
  budget_min,
  budget_max,
  status,
  CASE 
    WHEN location IS NOT NULL THEN COALESCE(NULLIF(split_part(location, ',', -1), ''), location)
    ELSE NULL
  END AS location_area,
  created_at,
  updated_at
FROM public.job_listings
WHERE status = 'open';

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_job_listings TO authenticated, anon;

-- Recreate public_provider_locations view with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_provider_locations;
CREATE VIEW public.public_provider_locations
    WITH (security_invoker=on)
    AS
SELECT 
  id,
  provider_id,
  city,
  postcode,
  latitude,
  longitude,
  is_primary,
  created_at
FROM public.provider_locations;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_provider_locations TO authenticated, anon;

-- Recreate public_provider_profiles view with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_provider_profiles;
CREATE VIEW public.public_provider_profiles
    WITH (security_invoker=on)
    AS
SELECT 
  id,
  full_name,
  bio,
  avatar_url,
  is_featured,
  is_verified,
  created_at
FROM public.profiles;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_provider_profiles TO authenticated, anon;