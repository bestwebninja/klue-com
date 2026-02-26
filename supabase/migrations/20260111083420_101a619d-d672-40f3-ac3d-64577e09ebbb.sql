-- Drop the overly permissive policy that allows viewing all profiles
DROP POLICY IF EXISTS "Authenticated users can view provider profiles" ON public.profiles;

-- Create a more restrictive policy: users can only view their own profile directly
-- Other users' profiles should be accessed through the public_provider_profiles view
CREATE POLICY "Users can only view own profile directly"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Grant SELECT on the secure view to authenticated users (view excludes email/phone)
GRANT SELECT ON public.public_provider_profiles TO authenticated;
GRANT SELECT ON public.public_provider_profiles TO anon;