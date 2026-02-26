-- Create expert questions table
CREATE TABLE public.expert_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.service_categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expert answers table
CREATE TABLE public.expert_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.expert_questions(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_answers ENABLE ROW LEVEL SECURITY;

-- RLS policies for expert_questions
CREATE POLICY "Anyone can view questions" ON public.expert_questions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post questions" ON public.expert_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions" ON public.expert_questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions" ON public.expert_questions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for expert_answers
CREATE POLICY "Anyone can view answers" ON public.expert_answers
  FOR SELECT USING (true);

CREATE POLICY "Providers can post answers" ON public.expert_answers
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own answers" ON public.expert_answers
  FOR UPDATE USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own answers" ON public.expert_answers
  FOR DELETE USING (auth.uid() = provider_id);

-- Add updated_at triggers
CREATE TRIGGER update_expert_questions_updated_at
  BEFORE UPDATE ON public.expert_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expert_answers_updated_at
  BEFORE UPDATE ON public.expert_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();