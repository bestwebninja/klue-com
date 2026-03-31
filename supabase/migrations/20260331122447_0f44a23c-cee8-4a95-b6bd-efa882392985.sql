-- Add missing columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS services_offered text[],
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS county text;

-- Create zip_code_intelligence_cache table
CREATE TABLE IF NOT EXISTS public.zip_code_intelligence_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code text UNIQUE NOT NULL,
  city text,
  state text,
  county text,
  latitude numeric,
  longitude numeric,
  refreshed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.zip_code_intelligence_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read zip cache" ON public.zip_code_intelligence_cache
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage zip cache" ON public.zip_code_intelligence_cache
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create dashboard_bootstraps table
CREATE TABLE IF NOT EXISTS public.dashboard_bootstraps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_key text NOT NULL,
  template_key text NOT NULL,
  profile_snapshot jsonb,
  widget_config jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.dashboard_bootstraps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bootstrap" ON public.dashboard_bootstraps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own bootstrap" ON public.dashboard_bootstraps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bootstrap" ON public.dashboard_bootstraps
  FOR UPDATE USING (auth.uid() = user_id);