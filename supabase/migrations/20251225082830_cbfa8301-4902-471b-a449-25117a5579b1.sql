-- Create a public view that only shows city/postcode level information (no full address)
CREATE OR REPLACE VIEW public.public_provider_locations AS
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

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view provider locations" ON public.provider_locations;

-- Create new policies:
-- 1. Authenticated users can view locations (needed for messaging, quotes, etc.)
CREATE POLICY "Authenticated users can view provider locations" 
ON public.provider_locations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Providers can always view their own locations (full access)
CREATE POLICY "Providers can view own locations" 
ON public.provider_locations 
FOR SELECT 
USING (auth.uid() = provider_id);