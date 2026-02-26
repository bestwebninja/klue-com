-- Allow any authenticated user to view provider profiles
-- This enables registered users to see provider contact details

CREATE POLICY "Authenticated users can view provider profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);