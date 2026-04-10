-- Homepage lead capture tables
-- Stores leads submitted from the homepage intake widget before signup

CREATE TABLE IF NOT EXISTS public.homepage_leads (
  id            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  services      TEXT[]      NOT NULL DEFAULT '{}',
  zip_code      TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  city          TEXT,
  state         TEXT,
  signup_status TEXT        NOT NULL DEFAULT 'guest',   -- 'guest' | 'signed_up'
  status        TEXT        NOT NULL DEFAULT 'new',     -- 'new' | 'matched' | 'expired'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-provider quote alert created when a homepage lead matches a registered provider
CREATE TABLE IF NOT EXISTS public.homepage_lead_quote_alerts (
  id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id          UUID        NOT NULL REFERENCES public.homepage_leads(id) ON DELETE CASCADE,
  provider_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  services         TEXT[]      NOT NULL DEFAULT '{}',
  zip_code         TEXT        NOT NULL,
  requester_email  TEXT,
  signup_status    TEXT        NOT NULL DEFAULT 'guest',
  is_read          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.homepage_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_lead_quote_alerts ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can submit a homepage lead
CREATE POLICY "public_insert_homepage_leads"
  ON public.homepage_leads
  FOR INSERT
  WITH CHECK (true);

-- Admins can read all leads
CREATE POLICY "admins_select_homepage_leads"
  ON public.homepage_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND user_role = 'admin'
    )
  );

-- Service (admin) role can insert quote alerts on behalf of the system
CREATE POLICY "service_role_insert_quote_alerts"
  ON public.homepage_lead_quote_alerts
  FOR INSERT
  WITH CHECK (true);

-- Providers can view their own quote alerts
CREATE POLICY "providers_select_own_quote_alerts"
  ON public.homepage_lead_quote_alerts
  FOR SELECT
  USING (auth.uid() = provider_id);

-- Providers can mark their own alerts as read
CREATE POLICY "providers_update_own_quote_alerts"
  ON public.homepage_lead_quote_alerts
  FOR UPDATE
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- ── Realtime ────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.homepage_lead_quote_alerts;
