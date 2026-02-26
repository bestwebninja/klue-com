-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy: Only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Allow public access to view only basic provider info (for browse providers page)
-- This uses a more restrictive approach - public can only see featured/verified providers
CREATE POLICY "Public can view featured providers" 
ON public.profiles 
FOR SELECT 
TO anon
USING (is_featured = true OR is_verified = true);