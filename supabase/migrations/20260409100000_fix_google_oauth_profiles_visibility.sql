-- Fix 1: Clean up the broken profiles SELECT policy state.
-- Migration 20260406175830 ran a bare CREATE POLICY using a name that already
-- existed (from 20260101150353), which causes a "policy already exists" error.
-- The result is an ambiguous/inconsistent RLS state where Google OAuth users
-- without the 'provider' role are invisible to non-admins.
--
-- Fix 2: Update handle_new_user to capture Google OAuth metadata.
-- Google stores: name/given_name/family_name/picture
-- Previous trigger only read:  full_name/first_name/last_name (email-signup fields)
-- Result: every Google OAuth user lands with all-null name fields in profiles.
--
-- Fix 3: Backfill existing Google OAuth users whose name fields are null
-- but whose Supabase auth identity data contains the correct values.

-- ── 1. RLS: clean slate ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can view provider profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles"      ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles"          ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles"                    ON public.profiles;
DROP POLICY IF EXISTS "profiles_select"                                ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy"                         ON public.profiles;

-- Single unambiguous SELECT policy:
--   • every user can always see their own profile
--   • admins see every profile (required for User Management panel)
--   • all authenticated users can see profiles of verified providers
CREATE POLICY "profiles_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(id, 'provider'::public.app_role)
);

-- ── 2. Trigger: handle Google OAuth metadata ─────────────────────────────────
-- Google OAuth raw_user_meta_data keys:
--   full display name : "name"       (email signup uses "full_name")
--   first name        : "given_name" (email signup uses "first_name")
--   last name         : "family_name"(email signup uses "last_name")
--   avatar            : "picture"    (email signup uses "avatar_url")

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_name       TEXT := nullif(trim(coalesce(
                               NEW.raw_user_meta_data ->> 'first_name',
                               NEW.raw_user_meta_data ->> 'given_name',  -- Google OAuth
                               ''
                             )), '');
  v_last_name        TEXT := nullif(trim(coalesce(
                               NEW.raw_user_meta_data ->> 'last_name',
                               NEW.raw_user_meta_data ->> 'family_name', -- Google OAuth
                               ''
                             )), '');
  v_full_name        TEXT := nullif(trim(coalesce(
                               NEW.raw_user_meta_data ->> 'full_name',
                               NEW.raw_user_meta_data ->> 'name',        -- Google OAuth
                               concat_ws(' ', v_first_name, v_last_name),
                               ''
                             )), '');
  v_avatar_url       TEXT := nullif(trim(coalesce(
                               NEW.raw_user_meta_data ->> 'avatar_url',
                               NEW.raw_user_meta_data ->> 'picture',     -- Google OAuth
                               ''
                             )), '');
  v_company_name     TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'company_name', '')), '');
  v_contract_type    TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'contractor_type', '')), '');
  v_service_type_label TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'service_type_label', '')), '');
  v_zip_code         TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'zip_code', '')), '');
  v_city             TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'city', '')), '');
  v_state            TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'state', '')), '');
  v_county           TEXT := nullif(trim(coalesce(NEW.raw_user_meta_data ->> 'county', '')), '');
  v_lat              NUMERIC := NULLIF(NEW.raw_user_meta_data ->> 'lat', '')::NUMERIC;
  v_lng              NUMERIC := NULLIF(NEW.raw_user_meta_data ->> 'lng', '')::NUMERIC;
  v_services         TEXT[] := COALESCE(
                                 ARRAY(SELECT jsonb_array_elements_text(
                                   COALESCE(NEW.raw_user_meta_data -> 'selected_services', '[]'::jsonb)
                                 )),
                                 '{}'
                               );
  v_service_key      TEXT;
  v_template_key     TEXT;
BEGIN
  IF v_service_type_label IS NULL AND array_length(v_services, 1) > 0 THEN
    v_service_type_label := v_services[1];
  END IF;

  v_service_key := lower(regexp_replace(coalesce(v_service_type_label, ''), '[^a-z0-9]+', '-', 'g'));
  IF v_service_key = '' THEN v_service_key := NULL; END IF;

  v_template_key := public.resolve_dashboard_template_key(v_contract_type, v_service_type_label);

  INSERT INTO public.profiles (
    id, email, full_name, first_name, last_name, avatar_url,
    company_name, services_offered, service_type_key, service_type_label,
    zip_code, city, state, county,
    latitude, longitude, lat, lng,
    dashboard_template_key, onboarding_status, profile_completion_pct
  )
  VALUES (
    NEW.id,
    trim(coalesce(NEW.email, '')),
    v_full_name,
    v_first_name,
    v_last_name,
    v_avatar_url,
    v_company_name,
    v_services,
    v_service_key,
    v_service_type_label,
    v_zip_code, v_city, v_state, v_county,
    COALESCE(v_lat, NULLIF(NEW.raw_user_meta_data ->> 'latitude', '')::NUMERIC),
    COALESCE(v_lng, NULLIF(NEW.raw_user_meta_data ->> 'longitude', '')::NUMERIC),
    COALESCE(v_lat, NULLIF(NEW.raw_user_meta_data ->> 'latitude', '')::NUMERIC),
    COALESCE(v_lng, NULLIF(NEW.raw_user_meta_data ->> 'longitude', '')::NUMERIC),
    v_template_key,
    CASE WHEN v_zip_code IS NOT NULL AND v_service_type_label IS NOT NULL THEN 'completed' ELSE 'started' END,
    CASE WHEN v_zip_code IS NOT NULL AND v_service_type_label IS NOT NULL THEN 70 ELSE 30 END
  )
  ON CONFLICT (id) DO UPDATE SET
    email                = EXCLUDED.email,
    full_name            = COALESCE(EXCLUDED.full_name,   profiles.full_name),
    first_name           = COALESCE(EXCLUDED.first_name,  profiles.first_name),
    last_name            = COALESCE(EXCLUDED.last_name,   profiles.last_name),
    avatar_url           = COALESCE(EXCLUDED.avatar_url,  profiles.avatar_url),
    company_name         = EXCLUDED.company_name,
    services_offered     = EXCLUDED.services_offered,
    service_type_key     = EXCLUDED.service_type_key,
    service_type_label   = EXCLUDED.service_type_label,
    zip_code             = EXCLUDED.zip_code,
    city                 = EXCLUDED.city,
    state                = EXCLUDED.state,
    county               = EXCLUDED.county,
    latitude             = EXCLUDED.latitude,
    longitude            = EXCLUDED.longitude,
    lat                  = EXCLUDED.lat,
    lng                  = EXCLUDED.lng,
    dashboard_template_key = EXCLUDED.dashboard_template_key,
    onboarding_status    = EXCLUDED.onboarding_status,
    profile_completion_pct = EXCLUDED.profile_completion_pct,
    updated_at           = now();

  RETURN NEW;
END;
$$;

-- ── 3. Backfill existing Google OAuth users with null names ──────────────────
-- auth.identities stores identity_data which contains the Google profile fields.
-- For email provider the identity_data has sub/email; for Google it has
-- name/given_name/family_name/picture as well.
UPDATE public.profiles p
SET
  full_name  = COALESCE(p.full_name,  nullif(trim(i.identity_data ->> 'name'), '')),
  first_name = COALESCE(p.first_name, nullif(trim(i.identity_data ->> 'given_name'), '')),
  last_name  = COALESCE(p.last_name,  nullif(trim(i.identity_data ->> 'family_name'), '')),
  avatar_url = COALESCE(p.avatar_url, nullif(trim(i.identity_data ->> 'picture'), '')),
  updated_at = now()
FROM auth.identities i
WHERE i.user_id = p.id
  AND i.provider = 'google'
  AND (
    p.full_name  IS NULL OR
    p.avatar_url IS NULL
  );
