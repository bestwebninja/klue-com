-- Drop the overly permissive policy that allows anyone to view job listings
DROP POLICY IF EXISTS "Anyone can view open job listings" ON public.job_listings;

-- Create a policy that requires authentication to view full job details (including coordinates)
-- Job owners can always see their own jobs regardless of status
CREATE POLICY "Authenticated users can view open job listings"
ON public.job_listings
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND status = 'open')
  OR (auth.uid() = posted_by)
);

-- Grant SELECT on the public view to anon users (view already masks location to area only)
GRANT SELECT ON public.public_job_listings TO anon;
GRANT SELECT ON public.public_job_listings TO authenticated;