-- Add policy to allow anyone to view all expert questions (they are public Q&A)
CREATE POLICY "Anyone can view all expert questions"
  ON public.expert_questions
  FOR SELECT
  USING (true);