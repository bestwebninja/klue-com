-- Add policy to allow authenticated users to view all profiles (public info only)
-- This is safe because the profiles table only contains public information
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Add policy to allow authenticated users to view all provider services
CREATE POLICY "Authenticated users can view all provider services"
  ON public.provider_services
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Add policy to allow authenticated users to view all provider locations
CREATE POLICY "Authenticated users can view all provider locations"
  ON public.provider_locations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);