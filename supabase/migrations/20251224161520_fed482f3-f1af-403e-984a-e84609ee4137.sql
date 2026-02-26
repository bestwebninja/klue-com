-- Create a public view for provider directory that only exposes non-sensitive fields
CREATE OR REPLACE VIEW public.public_provider_profiles AS
SELECT 
  id,
  full_name,
  bio,
  avatar_url,
  is_featured,
  is_verified,
  created_at
FROM public.profiles;

-- Grant access to the view for both authenticated and anonymous users
GRANT SELECT ON public.public_provider_profiles TO anon;
GRANT SELECT ON public.public_provider_profiles TO authenticated;

-- Drop the overly restrictive anon policy since we'll use the view for public access
DROP POLICY IF EXISTS "Public can view featured providers" ON public.profiles;