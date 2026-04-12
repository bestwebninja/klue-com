-- ============================================================
-- Veteran Profiles
-- Stores full military service history for veterans who sign up
-- on Kluje. Used for job matching, veteran network, badge awards,
-- and subscription benefit gating (3 months free on annual plans).
-- ============================================================

-- Add quick-filter columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_veteran          boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS veteran_branch       text,
  ADD COLUMN IF NOT EXISTS prefer_veteran_contractor boolean DEFAULT false;

-- Index for fast veteran contractor lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_veteran ON public.profiles (is_veteran)
  WHERE is_veteran = true;

-- ── veteran_profiles table ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.veteran_profiles (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core service record
  branch                      text NOT NULL,                        -- e.g. 'army', 'navy'
  rank_grade                  text,                                 -- E-5, O-3, W-2 …
  rank_title                  text,                                 -- Sergeant, Captain …
  years_of_service            text,                                 -- '8-12', '20+' …
  service_eras                text[] DEFAULT '{}',                  -- ['post_9_11', 'gulf_war']

  -- Specialty / MOS
  specialty_code              text,                                 -- 12B, BU, 3E0X1 …
  specialty_title             text,                                 -- human-readable title
  unit_type                   text,                                 -- Infantry, Seabee, …

  -- Duty station & unit
  last_duty_station           text,                                 -- Fort Bragg, Camp Pendleton …
  last_unit                   text,                                 -- e.g. "82nd Airborne Division"

  -- Security
  clearance_level             text DEFAULT 'none',

  -- VA / disability
  va_disability_rating        integer CHECK (va_disability_rating IN (0,10,20,30,40,50,60,70,80,90,100)),
  discharge_type              text DEFAULT 'honorable',             -- honorable, general, other

  -- Business certifications
  is_sdvosb                   boolean DEFAULT false,                -- Service-Disabled Veteran-Owned Small Business
  is_vosb                     boolean DEFAULT false,                -- Veteran-Owned Small Business
  sdvosb_certified            boolean DEFAULT false,                -- has active SAM/SBA certification
  state_certifications        text[] DEFAULT '{}',                  -- state-level veteran biz certs

  -- Network & matching
  open_to_veteran_network     boolean DEFAULT true,                 -- consent to appear in veteran network
  preferred_work_radius_miles integer DEFAULT 50,
  trade_affinities            text[] DEFAULT '{}',                  -- AI-derived trade keys from MOS

  -- Subscription benefit
  subscription_credit_months  integer DEFAULT 3,                    -- months free on annual plan
  subscription_credit_applied boolean DEFAULT false,                -- redeemed flag

  -- Misc
  additional_notes            text,
  verified_at                 timestamptz,                          -- when DD-214 or similar is verified
  created_at                  timestamptz DEFAULT now(),
  updated_at                  timestamptz DEFAULT now(),

  UNIQUE (user_id)
);

-- ── veteran_network_connections table ─────────────────────────────────────
-- Tracks peer connections between veteran contractors for the
-- "same unit / same base" matching feature.

CREATE TABLE IF NOT EXISTS public.veteran_network_connections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'pending',  -- pending, accepted, declined
  match_reason    text,                             -- 'same_branch', 'same_unit', 'same_base', 'same_era'
  created_at      timestamptz DEFAULT now(),
  UNIQUE (requester_id, recipient_id)
);

-- ── updated_at trigger ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS veteran_profiles_updated_at ON public.veteran_profiles;
CREATE TRIGGER veteran_profiles_updated_at
  BEFORE UPDATE ON public.veteran_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE public.veteran_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veteran_network_connections ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own veteran profile
CREATE POLICY "veteran_profiles_own_rw" ON public.veteran_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Veterans who opted in can be discovered by other veterans (read-only, limited columns)
CREATE POLICY "veteran_profiles_network_read" ON public.veteran_profiles
  FOR SELECT USING (open_to_veteran_network = true);

-- Admins have full access
CREATE POLICY "veteran_profiles_admin" ON public.veteran_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Network connections
CREATE POLICY "veteran_connections_rw" ON public.veteran_network_connections
  FOR ALL USING (
    auth.uid() = requester_id OR auth.uid() = recipient_id
  ) WITH CHECK (
    auth.uid() = requester_id
  );

-- ── Homeowner preference index ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_prefer_veteran
  ON public.profiles (prefer_veteran_contractor)
  WHERE prefer_veteran_contractor = true;

COMMENT ON TABLE public.veteran_profiles IS
  'Full military service record for veteran contractors. Drives job matching, '
  'veteran network, badge awards, and 3-month subscription credit on annual plans.';
