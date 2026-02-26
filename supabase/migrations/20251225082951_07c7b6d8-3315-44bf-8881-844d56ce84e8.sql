-- Drop the overly permissive anon policy we just created
DROP POLICY IF EXISTS "Anyone can view provider locations via public view" ON public.provider_locations;

-- The public view uses SECURITY INVOKER, and anon users need to access it
-- But we don't want them to see the full address column
-- Solution: Create a function that returns the public location data

-- Create a security definer function that returns only public location info
CREATE OR REPLACE FUNCTION public.get_public_provider_locations(provider_ids uuid[])
RETURNS TABLE (
  id uuid,
  provider_id uuid,
  city text,
  postcode text,
  latitude numeric,
  longitude numeric,
  is_primary boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    provider_id,
    city,
    postcode,
    latitude,
    longitude,
    is_primary,
    created_at
  FROM public.provider_locations
  WHERE provider_id = ANY(provider_ids);
$$;