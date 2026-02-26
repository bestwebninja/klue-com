-- Create RLS policy to allow users to insert their own provider role during signup
CREATE POLICY "Users can insert own provider role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'provider'::app_role
);