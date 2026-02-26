-- Create a SECURITY DEFINER function to fetch non-sensitive provider profile fields
-- This safely bypasses RLS on profiles while only returning public fields.
CREATE OR REPLACE FUNCTION public.get_public_provider_profiles(provider_ids uuid[])
RETURNS TABLE(
  id uuid,
  full_name text,
  bio text,
  avatar_url text,
  is_featured boolean,
  is_verified boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.full_name,
    p.bio,
    p.avatar_url,
    p.is_featured,
    p.is_verified,
    p.created_at
  FROM public.profiles p
  WHERE p.id = ANY(provider_ids);
$$;

-- Allow public callers (anon/authenticated) to execute the function
GRANT EXECUTE ON FUNCTION public.get_public_provider_profiles(uuid[]) TO anon, authenticated;

-- (Optional hardening) Make sure public can't select the underlying profiles table via this change
-- No grants added for profiles here by design.