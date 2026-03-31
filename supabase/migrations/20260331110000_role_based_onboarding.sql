-- Role-based onboarding profile expansion and intelligence cache
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS services_offered TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS zip_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 6);

CREATE TABLE IF NOT EXISTS public.dashboard_bootstraps (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  profile_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  template_key TEXT NOT NULL,
  widget_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  intelligence_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dashboard_bootstraps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own dashboard bootstrap" ON public.dashboard_bootstraps;
DROP POLICY IF EXISTS "Users can modify own dashboard bootstrap" ON public.dashboard_bootstraps;

CREATE POLICY "Users can view own dashboard bootstrap"
ON public.dashboard_bootstraps
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own dashboard bootstrap"
ON public.dashboard_bootstraps
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_dashboard_bootstraps_updated_at
BEFORE UPDATE ON public.dashboard_bootstraps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.zip_code_intelligence_cache (
  zip_code TEXT PRIMARY KEY,
  city TEXT,
  state TEXT,
  county TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  weather_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  crime_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  source JSONB NOT NULL DEFAULT '{}'::jsonb,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.zip_code_intelligence_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read zip intelligence cache" ON public.zip_code_intelligence_cache;
DROP POLICY IF EXISTS "Service role manages zip intelligence cache" ON public.zip_code_intelligence_cache;

CREATE POLICY "Authenticated can read zip intelligence cache"
ON public.zip_code_intelligence_cache
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role manages zip intelligence cache"
ON public.zip_code_intelligence_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE TRIGGER update_zip_code_intelligence_cache_updated_at
BEFORE UPDATE ON public.zip_code_intelligence_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    company_name,
    services_offered,
    zip_code,
    city,
    state,
    county,
    latitude,
    longitude
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'company_name',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data -> 'selected_services', '[]'::jsonb))), '{}'),
    NEW.raw_user_meta_data ->> 'zip_code',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state',
    NEW.raw_user_meta_data ->> 'county',
    NULLIF(NEW.raw_user_meta_data ->> 'latitude', '')::NUMERIC,
    NULLIF(NEW.raw_user_meta_data ->> 'longitude', '')::NUMERIC
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    company_name = EXCLUDED.company_name,
    services_offered = EXCLUDED.services_offered,
    zip_code = EXCLUDED.zip_code,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    county = EXCLUDED.county,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = now();

  RETURN NEW;
END;
$$;
