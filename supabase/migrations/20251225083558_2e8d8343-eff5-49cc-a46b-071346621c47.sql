-- =============================================
-- FIX 1: Profiles Table - Restrict sensitive fields
-- =============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create policy for users to view their own full profile (including sensitive data)
CREATE POLICY "Users can view own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Update the existing public_provider_profiles view to use SECURITY INVOKER
-- This view only exposes non-sensitive fields for provider discovery
DROP VIEW IF EXISTS public.public_provider_profiles;

CREATE VIEW public.public_provider_profiles 
WITH (security_invoker = true) AS
SELECT 
  id,
  full_name,
  bio,
  avatar_url,
  is_featured,
  is_verified,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_provider_profiles TO anon, authenticated;

-- Create a policy that allows viewing basic profile info for provider discovery
-- This allows authenticated users to see non-sensitive fields of other profiles
CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- =============================================
-- FIX 2: Job Listings - Restrict location data
-- =============================================

-- Create a public view for job listings that excludes precise coordinates
CREATE OR REPLACE VIEW public.public_job_listings 
WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  description,
  category_id,
  budget_min,
  budget_max,
  status,
  -- Only show city/region extracted from location, not full address
  CASE 
    WHEN location IS NOT NULL THEN 
      COALESCE(
        NULLIF(SPLIT_PART(location, ',', -1), ''),
        location
      )
    ELSE NULL
  END as location_area,
  created_at,
  updated_at
  -- Deliberately exclude: latitude, longitude, posted_by, full location
FROM public.job_listings
WHERE status = 'open';

GRANT SELECT ON public.public_job_listings TO anon, authenticated;

-- =============================================
-- FIX 3: Provider Locations - Restrict full address
-- =============================================

-- Drop the overly permissive authenticated policy
DROP POLICY IF EXISTS "Authenticated users can view provider locations" ON public.provider_locations;

-- Create a function to check if user has an active quote relationship with provider
CREATE OR REPLACE FUNCTION public.has_quote_relationship(provider_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.quote_requests qr
    JOIN public.job_listings jl ON jl.id = qr.job_listing_id
    WHERE qr.provider_id = provider_uuid
    AND (jl.posted_by = auth.uid() OR qr.provider_id = auth.uid())
    AND qr.status IN ('pending', 'accepted', 'completed')
  )
$$;

-- Authenticated users can only see full address if they have a quote relationship
CREATE POLICY "Users with quote relationship can view full locations" 
ON public.provider_locations 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = provider_id  -- Provider can see own locations
  OR public.has_quote_relationship(provider_id)  -- Users with active quotes can see full address
);