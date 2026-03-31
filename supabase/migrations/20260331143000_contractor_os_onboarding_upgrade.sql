-- Contractor OS onboarding + dashboard architecture upgrade

-- Keep using shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Expand profiles for normalized onboarding + dashboard assignment
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS service_type_key TEXT,
  ADD COLUMN IF NOT EXISTS service_type_label TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT NOT NULL DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS lat NUMERIC(10, 6),
  ADD COLUMN IF NOT EXISTS lng NUMERIC(10, 6),
  ADD COLUMN IF NOT EXISTS coverage_radius_miles INTEGER NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS profile_completion_pct INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT NOT NULL DEFAULT 'started',
  ADD COLUMN IF NOT EXISTS dashboard_template_key TEXT,
  ADD COLUMN IF NOT EXISTS dashboard_version INTEGER NOT NULL DEFAULT 1;

UPDATE public.profiles
SET
  lat = COALESCE(lat, latitude),
  lng = COALESCE(lng, longitude),
  service_type_label = COALESCE(service_type_label, services_offered[1]),
  full_name = COALESCE(full_name, concat_ws(' ', first_name, last_name))
WHERE true;

-- Canonical service type catalog
CREATE TABLE IF NOT EXISTS public.service_types (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  dashboard_template_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 100
);

ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read service types" ON public.service_types;
CREATE POLICY "Anyone can read service types"
ON public.service_types
FOR SELECT
USING (true);

-- Dashboard templates are config-driven and reusable
CREATE TABLE IF NOT EXISTS public.dashboard_templates (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  user_category TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dashboard_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read dashboard templates" ON public.dashboard_templates;
CREATE POLICY "Anyone can read dashboard templates"
ON public.dashboard_templates
FOR SELECT
USING (true);

DROP TRIGGER IF EXISTS dashboard_templates_set_updated_at ON public.dashboard_templates;
CREATE TRIGGER dashboard_templates_set_updated_at
BEFORE UPDATE ON public.dashboard_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Company entity for investor-grade account modeling
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  legal_name TEXT,
  website_url TEXT,
  phone TEXT,
  email TEXT,
  service_type_key TEXT,
  primary_zip_code TEXT,
  city TEXT,
  state TEXT,
  county TEXT,
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own company" ON public.companies;
DROP POLICY IF EXISTS "Users can manage own company" ON public.companies;
CREATE POLICY "Users can read own company"
ON public.companies
FOR SELECT
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can manage own company"
ON public.companies
FOR ALL
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

DROP TRIGGER IF EXISTS companies_set_updated_at ON public.companies;
CREATE TRIGGER companies_set_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Per-user dashboard preferences
CREATE TABLE IF NOT EXISTS public.user_dashboard_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,
  hidden_widget_keys TEXT[] NOT NULL DEFAULT '{}',
  pinned_widget_keys TEXT[] NOT NULL DEFAULT '{}',
  widget_layout_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own dashboard preferences" ON public.user_dashboard_preferences;
DROP POLICY IF EXISTS "Users can manage own dashboard preferences" ON public.user_dashboard_preferences;
CREATE POLICY "Users can read own dashboard preferences"
ON public.user_dashboard_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own dashboard preferences"
ON public.user_dashboard_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS user_dashboard_preferences_set_updated_at ON public.user_dashboard_preferences;
CREATE TRIGGER user_dashboard_preferences_set_updated_at
BEFORE UPDATE ON public.user_dashboard_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Zip cache for normalized location lookups
CREATE TABLE IF NOT EXISTS public.zip_code_cache (
  zip_code TEXT PRIMARY KEY,
  city TEXT,
  state TEXT,
  county TEXT,
  country_code TEXT NOT NULL DEFAULT 'US',
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  timezone TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.zip_code_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read zip cache" ON public.zip_code_cache;
DROP POLICY IF EXISTS "Service role manages zip cache" ON public.zip_code_cache;
CREATE POLICY "Authenticated can read zip cache"
ON public.zip_code_cache
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Service role manages zip cache"
ON public.zip_code_cache
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Geo intelligence cache (weather/crime/logistics/suppliers)
CREATE TABLE IF NOT EXISTS public.geo_intelligence (
  zip_code TEXT PRIMARY KEY,
  weather_summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  forecast_summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  crime_summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  logistics_summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  supplier_summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  weather_refreshed_at TIMESTAMPTZ,
  crime_refreshed_at TIMESTAMPTZ,
  logistics_refreshed_at TIMESTAMPTZ,
  supplier_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.geo_intelligence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read geo intelligence" ON public.geo_intelligence;
DROP POLICY IF EXISTS "Service role manages geo intelligence" ON public.geo_intelligence;
CREATE POLICY "Authenticated can read geo intelligence"
ON public.geo_intelligence
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Service role manages geo intelligence"
ON public.geo_intelligence
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS geo_intelligence_set_updated_at ON public.geo_intelligence;
CREATE TRIGGER geo_intelligence_set_updated_at
BEFORE UPDATE ON public.geo_intelligence
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Audit events for profile lifecycle
CREATE TABLE IF NOT EXISTS public.profile_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile audit log" ON public.profile_audit_log;
DROP POLICY IF EXISTS "Service role manages profile audit log" ON public.profile_audit_log;
CREATE POLICY "Users can read own profile audit log"
ON public.profile_audit_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role manages profile audit log"
ON public.profile_audit_log
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_profiles_service_type_key ON public.profiles(service_type_key);
CREATE INDEX IF NOT EXISTS idx_profiles_dashboard_template_key ON public.profiles(dashboard_template_key);
CREATE INDEX IF NOT EXISTS idx_profiles_zip_code ON public.profiles(zip_code);
CREATE INDEX IF NOT EXISTS idx_companies_owner_user_id ON public.companies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_companies_zip ON public.companies(primary_zip_code);
CREATE INDEX IF NOT EXISTS idx_geo_intelligence_updated_at ON public.geo_intelligence(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_audit_log_user_event ON public.profile_audit_log(user_id, event_type, created_at DESC);

-- Template resolution helper
CREATE OR REPLACE FUNCTION public.resolve_dashboard_template_key(contractor_type TEXT, service_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized_service TEXT := lower(coalesce(service_name, ''));
BEGIN
  IF contractor_type = 'general' OR normalized_service LIKE '%general contractor%' THEN
    RETURN 'general-contractor';
  ELSIF normalized_service LIKE '%hvac%' THEN
    RETURN 'hvac';
  ELSIF normalized_service LIKE '%plumb%' THEN
    RETURN 'plumbing';
  ELSIF normalized_service LIKE '%electr%' THEN
    RETURN 'electrical';
  ELSIF normalized_service LIKE '%roof%' THEN
    RETURN 'roofing';
  ELSIF normalized_service LIKE '%paint%' THEN
    RETURN 'painting';
  ELSIF normalized_service LIKE '%carpent%' THEN
    RETURN 'carpentry';
  END IF;

  RETURN 'subcontractor-default';
END;
$$;

-- Ensure onboarding trigger provisions normalized profile + company + dashboard data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_name TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'first_name', '')), '');
  v_last_name TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'last_name', '')), '');
  v_company_name TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'company_name', '')), '');
  v_contract_type TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'contractor_type', '')), '');
  v_service_type_label TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'service_type_label', '')), '');
  v_zip_code TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'zip_code', '')), '');
  v_city TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'city', '')), '');
  v_state TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'state', '')), '');
  v_county TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'county', '')), '');
  v_lat NUMERIC := NULLIF(NEW.raw_user_meta_data ->> 'lat', '')::NUMERIC;
  v_lng NUMERIC := NULLIF(NEW.raw_user_meta_data ->> 'lng', '')::NUMERIC;
  v_services TEXT[] := COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data -> 'selected_services', '[]'::jsonb))), '{}');
  v_service_key TEXT;
  v_template_key TEXT;
BEGIN
  IF v_service_type_label IS NULL AND array_length(v_services, 1) > 0 THEN
    v_service_type_label := v_services[1];
  END IF;

  v_service_key := lower(regexp_replace(coalesce(v_service_type_label, ''), '[^a-z0-9]+', '-', 'g'));
  IF v_service_key = '' THEN
    v_service_key := NULL;
  END IF;

  v_template_key := public.resolve_dashboard_template_key(v_contract_type, v_service_type_label);

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    company_name,
    services_offered,
    service_type_key,
    service_type_label,
    zip_code,
    city,
    state,
    county,
    latitude,
    longitude,
    lat,
    lng,
    dashboard_template_key,
    onboarding_status,
    profile_completion_pct
  )
  VALUES (
    NEW.id,
    trim(coalesce(NEW.email, '')),
    nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'full_name', concat_ws(' ', v_first_name, v_last_name))), ''),
    v_first_name,
    v_last_name,
    v_company_name,
    v_services,
    v_service_key,
    v_service_type_label,
    v_zip_code,
    v_city,
    v_state,
    v_county,
    COALESCE(v_lat, NULLIF(NEW.raw_user_meta_data ->> 'latitude', '')::NUMERIC),
    COALESCE(v_lng, NULLIF(NEW.raw_user_meta_data ->> 'longitude', '')::NUMERIC),
    COALESCE(v_lat, NULLIF(NEW.raw_user_meta_data ->> 'latitude', '')::NUMERIC),
    COALESCE(v_lng, NULLIF(NEW.raw_user_meta_data ->> 'longitude', '')::NUMERIC),
    v_template_key,
    CASE WHEN v_zip_code IS NOT NULL AND v_service_type_label IS NOT NULL THEN 'completed' ELSE 'started' END,
    CASE WHEN v_zip_code IS NOT NULL AND v_service_type_label IS NOT NULL THEN 70 ELSE 30 END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    company_name = EXCLUDED.company_name,
    services_offered = EXCLUDED.services_offered,
    service_type_key = EXCLUDED.service_type_key,
    service_type_label = EXCLUDED.service_type_label,
    zip_code = EXCLUDED.zip_code,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    county = EXCLUDED.county,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    dashboard_template_key = EXCLUDED.dashboard_template_key,
    onboarding_status = EXCLUDED.onboarding_status,
    profile_completion_pct = EXCLUDED.profile_completion_pct,
    updated_at = now();

  IF v_company_name IS NOT NULL THEN
    INSERT INTO public.companies (
      owner_user_id,
      company_name,
      service_type_key,
      primary_zip_code,
      city,
      state,
      county,
      lat,
      lng,
      email
    )
    VALUES (
      NEW.id,
      v_company_name,
      v_service_key,
      v_zip_code,
      v_city,
      v_state,
      v_county,
      COALESCE(v_lat, NULLIF(NEW.raw_user_meta_data ->> 'latitude', '')::NUMERIC),
      COALESCE(v_lng, NULLIF(NEW.raw_user_meta_data ->> 'longitude', '')::NUMERIC),
      trim(coalesce(NEW.email, ''))
    )
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.user_dashboard_preferences (user_id, template_key, pinned_widget_keys, widget_layout_json)
  VALUES (NEW.id, v_template_key, ARRAY['profile_summary', 'weather', 'ai_next_action'], '{}'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.profile_audit_log (user_id, event_type, payload_json)
  VALUES (
    NEW.id,
    'signup_provisioned',
    jsonb_build_object('service_type_label', v_service_type_label, 'zip_code', v_zip_code, 'template_key', v_template_key)
  );

  RETURN NEW;
END;
$$;

-- Idempotent seed service types
INSERT INTO public.service_types (key, label, dashboard_template_key, is_active, sort_order)
VALUES
  ('general-contractor', 'General Contractor', 'general-contractor', true, 1),
  ('hvac', 'HVAC', 'hvac', true, 10),
  ('plumbing', 'Plumbing', 'plumbing', true, 20),
  ('electrical', 'Electrical', 'electrical', true, 30),
  ('roofing', 'Roofing', 'roofing', true, 40),
  ('painting', 'Painting', 'painting', true, 50),
  ('carpentry', 'Carpentry', 'carpentry', true, 60),
  ('subcontractor-default', 'Subcontractor', 'subcontractor-default', true, 999)
ON CONFLICT (key) DO UPDATE
SET
  label = EXCLUDED.label,
  dashboard_template_key = EXCLUDED.dashboard_template_key,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Idempotent seed templates
INSERT INTO public.dashboard_templates (key, label, user_category, description, version, is_default, is_active, config_json)
VALUES
  ('general-contractor', 'General Contractor / Master Dashboard', 'general_contractor', 'Full operations and risk command center', 1, false, true, jsonb_build_object('widgetKeys', jsonb_build_array('profile_summary','profile_completion','weather','area_risk','jobs','suppliers','legal_logistics','ai_next_action','project_alerts','compliance'))),
  ('hvac', 'HVAC Trade Dashboard', 'subcontractor', 'Field service and weather-aware dispatch for HVAC teams', 1, false, true, jsonb_build_object('widgetKeys', jsonb_build_array('profile_summary','weather','area_risk','jobs','ai_next_action'))),
  ('plumbing', 'Plumbing Trade Dashboard', 'subcontractor', 'Plumbing-focused workload and local risk overview', 1, false, true, jsonb_build_object('widgetKeys', jsonb_build_array('profile_summary','weather','area_risk','jobs','ai_next_action'))),
  ('electrical', 'Electrical Trade Dashboard', 'subcontractor', 'Electrical pipeline, weather windows, and safety context', 1, false, true, jsonb_build_object('widgetKeys', jsonb_build_array('profile_summary','weather','area_risk','jobs','compliance','ai_next_action'))),
  ('roofing', 'Roofing Trade Dashboard', 'subcontractor', 'Roofing with weather and area risk intelligence', 1, false, true, jsonb_build_object('widgetKeys', jsonb_build_array('profile_summary','weather','area_risk','jobs','project_alerts','ai_next_action'))),
  ('painting', 'Painting Trade Dashboard', 'subcontractor', 'Painting workflow and local conditions', 1, false, true, jsonb_build_object('widgetKeys', jsonb_build_array('profile_summary','weather','area_risk','jobs','ai_next_action'))),
  ('carpentry', 'Carpentry Trade Dashboard', 'subcontractor', 'Carpentry workflow and supply-aware insights', 1, false, true, jsonb_build_object('widgetKeys', jsonb_build_array('profile_summary','weather','jobs','suppliers','ai_next_action'))),
  ('subcontractor-default', 'Subcontractor Dashboard', 'subcontractor', 'Fallback template for specialty trades', 1, true, true, jsonb_build_object('widgetKeys', jsonb_build_array('profile_summary','weather','area_risk','jobs','ai_next_action')))
ON CONFLICT (key) DO UPDATE
SET
  label = EXCLUDED.label,
  user_category = EXCLUDED.user_category,
  description = EXCLUDED.description,
  version = EXCLUDED.version,
  is_default = EXCLUDED.is_default,
  is_active = EXCLUDED.is_active,
  config_json = EXCLUDED.config_json,
  updated_at = now();
