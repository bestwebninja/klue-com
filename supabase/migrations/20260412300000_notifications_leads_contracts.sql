-- ============================================================
-- Notifications, Job Lead Scores, and Contracts
-- ============================================================

-- ------------------------------------------------------------
-- 1. notifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN (
                  'job_match', 'quote_received', 'contract_signed',
                  'payment_due', 'agent_alert', 'lead_scored', 'message'
                )),
  title         text NOT NULL,
  body          text,
  metadata      jsonb DEFAULT '{}',
  read          boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own notifications
CREATE POLICY "notifications_own_select" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_own_update" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Service role (edge functions) can insert for any user
CREATE POLICY "notifications_service_insert" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Admins have full access
CREATE POLICY "notifications_admin_all" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 2. job_lead_scores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_lead_scores (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                    uuid NOT NULL,
  scored_by_user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score                     integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  tier                      text NOT NULL CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),
  intent_signals            text[] DEFAULT '{}',
  contractor_match_strength numeric(3,2) DEFAULT 0,
  conversion_probability    numeric(3,2) DEFAULT 0,
  estimated_job_value       integer DEFAULT 0,
  recommended_response      text,
  metadata                  jsonb DEFAULT '{}',
  created_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_lead_scores_user_idx
  ON public.job_lead_scores (scored_by_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS job_lead_scores_tier_idx
  ON public.job_lead_scores (tier, created_at DESC);

ALTER TABLE public.job_lead_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_scores_own_select" ON public.job_lead_scores
  FOR SELECT USING (auth.uid() = scored_by_user_id);

CREATE POLICY "lead_scores_own_insert" ON public.job_lead_scores
  FOR INSERT WITH CHECK (auth.uid() = scored_by_user_id);

CREATE POLICY "lead_scores_service_insert" ON public.job_lead_scores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "lead_scores_admin_all" ON public.job_lead_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 3. contracts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contracts (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id               uuid,
  contractor_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  homeowner_id              uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title                     text NOT NULL,
  trade_type                text,
  total_amount_usd          numeric(12,2) DEFAULT 0,
  status                    text NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'sent', 'signed', 'voided')),
  contract_html             text,
  contractor_signature      text,
  homeowner_signature       text,
  contractor_signed_at      timestamptz,
  homeowner_signed_at       timestamptz,
  sent_at                   timestamptz,
  voided_at                 timestamptz,
  voided_reason             text,
  metadata                  jsonb DEFAULT '{}',
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contracts_contractor_idx
  ON public.contracts (contractor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS contracts_homeowner_idx
  ON public.contracts (homeowner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS contracts_status_idx
  ON public.contracts (status, created_at DESC);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Contractor can read/write their own contracts
CREATE POLICY "contracts_contractor_all" ON public.contracts
  FOR ALL USING (auth.uid() = contractor_id) WITH CHECK (auth.uid() = contractor_id);

-- Homeowner can read contracts they are party to (and update for signature)
CREATE POLICY "contracts_homeowner_select" ON public.contracts
  FOR SELECT USING (auth.uid() = homeowner_id);

CREATE POLICY "contracts_homeowner_update" ON public.contracts
  FOR UPDATE USING (auth.uid() = homeowner_id)
  WITH CHECK (auth.uid() = homeowner_id);

-- Admins have full access
CREATE POLICY "contracts_admin_all" ON public.contracts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_contracts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contracts_updated_at ON public.contracts;
CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_contracts_updated_at();
