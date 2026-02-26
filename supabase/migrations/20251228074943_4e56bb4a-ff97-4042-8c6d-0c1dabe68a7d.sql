-- Create a public view for expert_questions that hides user_id from anonymous users
CREATE OR REPLACE VIEW public.public_expert_questions AS
SELECT 
  id,
  title,
  content,
  category_id,
  created_at,
  updated_at,
  -- Only show user_id to the question author themselves
  CASE 
    WHEN auth.uid() = user_id THEN user_id
    ELSE NULL
  END as user_id
FROM public.expert_questions;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_expert_questions TO authenticated, anon;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view questions" ON public.expert_questions;

-- Create new policies that restrict public access
-- Only the question author can see their own questions directly
CREATE POLICY "Users can view own questions directly" 
ON public.expert_questions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all questions
CREATE POLICY "Admins can view all questions" 
ON public.expert_questions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));