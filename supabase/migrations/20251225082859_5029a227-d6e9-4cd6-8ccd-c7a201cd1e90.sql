-- Fix the security definer view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_provider_locations;

CREATE VIEW public.public_provider_locations 
WITH (security_invoker = true) AS
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

-- Grant access to the view
GRANT SELECT ON public.public_provider_locations TO anon, authenticated;