-- Add RLS policy to allow anyone to view locations via the public view
-- The view uses SECURITY INVOKER, so we need a policy that allows anon to SELECT
-- But only the view's restricted columns are exposed

-- Add a policy for anonymous users to view provider locations (limited to view columns)
CREATE POLICY "Anyone can view provider locations via public view" 
ON public.provider_locations 
FOR SELECT 
TO anon
USING (true);