-- =============================================================================
-- SOCIAL AUTH SCHEMA EXTENSION
-- Adds LinkedIn/social profile columns, push subscriptions, and DB cleanup.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES: add social + notification preference columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS linkedin_profile_url     TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_verified_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS linkedin_headline        TEXT,
  ADD COLUMN IF NOT EXISTS push_enabled             BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS push_consent_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS newsletter_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS newsletter_consent_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_auth_method         TEXT    NOT NULL DEFAULT 'email'
    CHECK (last_auth_method IN ('email', 'google', 'linkedin'));

-- Index for social lookups
CREATE INDEX IF NOT EXISTS profiles_last_auth_method_idx ON public.profiles (last_auth_method);

-- ---------------------------------------------------------------------------
-- 2. PUSH SUBSCRIPTIONS table (VAPID Web Push)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT        NOT NULL,
  p256dh      TEXT        NOT NULL,
  auth_key    TEXT        NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. SOCIAL AUTH EVENTS audit table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_auth_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  provider        TEXT        NOT NULL,          -- 'google' | 'linkedin'
  event           TEXT        NOT NULL,          -- 'signup' | 'login' | 'age_rejected'
  ip_address      TEXT,
  metadata        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_auth_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view social auth events"
  ON public.social_auth_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Service-role insert only (no user can write directly)

-- ---------------------------------------------------------------------------
-- 4. LINKEDIN AGE GATE: track pending verifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.linkedin_age_checks (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_sub        TEXT,
  profile_url         TEXT,
  check_status        TEXT        NOT NULL DEFAULT 'pending'
    CHECK (check_status IN ('pending', 'approved', 'rejected', 'manual_review')),
  rejection_reason    TEXT,
  raw_response        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  checked_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.linkedin_age_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own age check"
  ON public.linkedin_age_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage age checks"
  ON public.linkedin_age_checks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 5. NEWSLETTER SUBSCRIBERS: add push_enabled + consent tracking if missing
-- ---------------------------------------------------------------------------
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS push_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS push_consent_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_source     TEXT DEFAULT 'newsletter_page';

-- ---------------------------------------------------------------------------
-- 6. DATABASE CLEANUP (idempotent, transactional, admin-safe)
--    Removes stale/orphaned accounts inactive > 90 days with no email verify.
--    NEVER touches admin accounts.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_deleted_count  INTEGER := 0;
  v_cutoff         TIMESTAMPTZ := now() - INTERVAL '90 days';
BEGIN
  -- Log intent
  RAISE NOTICE 'Starting DB cleanup: purging unverified accounts inactive since %', v_cutoff;

  -- 1. Delete orphaned profile rows with no corresponding auth.users entry
  DELETE FROM public.profiles p
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Removed % orphaned profile rows', v_deleted_count;

  -- 2. Purge unverified, inactive auth.users accounts (non-admin, > 90 days old)
  --    Conditions:
  --      - email_confirmed_at IS NULL (never verified)
  --      - last_sign_in_at IS NULL OR last_sign_in_at < cutoff
  --      - created_at < cutoff
  --      - NOT an admin (not in user_roles with role = 'admin')
  WITH stale_users AS (
    SELECT u.id
    FROM auth.users u
    WHERE u.email_confirmed_at IS NULL
      AND (u.last_sign_in_at IS NULL OR u.last_sign_in_at < v_cutoff)
      AND u.created_at < v_cutoff
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = u.id AND ur.role = 'admin'
      )
  )
  DELETE FROM auth.users
  WHERE id IN (SELECT id FROM stale_users);
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Purged % stale unverified auth.users accounts', v_deleted_count;

  -- 3. Delete expired OAuth tokens / stale sessions (Supabase manages sessions
  --    in auth.sessions; delete sessions older than 30 days with no refresh)
  DELETE FROM auth.sessions
  WHERE refreshed_at IS NULL
    AND created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Removed % stale sessions', v_deleted_count;

  -- 4. Purge expired phone verification codes (older than 24 hours)
  DELETE FROM public.phone_verifications
  WHERE expires_at < now() - INTERVAL '24 hours';
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Removed % expired phone verification records', v_deleted_count;

  RAISE NOTICE 'DB cleanup complete.';
END $$;

-- ---------------------------------------------------------------------------
-- 7. INDEXES for auth performance
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS profiles_email_idx         ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_push_enabled_idx  ON public.profiles (push_enabled) WHERE push_enabled = TRUE;
