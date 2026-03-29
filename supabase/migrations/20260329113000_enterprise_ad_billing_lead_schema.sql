-- ============================================================
-- Enterprise core schema for ads, leads, and billing domains
-- Source blueprint: /docs/db-schema.md
-- ============================================================

CREATE EXTENSION IF NOT EXISTS citext;

CREATE SCHEMA IF NOT EXISTS core;

-- Shared updated_at helper for mutable rows
CREATE OR REPLACE FUNCTION core.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------
-- Tenancy baseline (required by backend X-Tenant-Id model)
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS core.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'trial', 'churned')),
  plan_tier TEXT NOT NULL DEFAULT 'starter'
    CHECK (plan_tier IN ('starter', 'growth', 'enterprise')),
  billing_customer_id TEXT,
  settings_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS core_tenants_slug_active_uq
  ON core.tenants (slug)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS core_tenants_status_idx
  ON core.tenants (status);
CREATE INDEX IF NOT EXISTS core_tenants_plan_tier_idx
  ON core.tenants (plan_tier);

DROP TRIGGER IF EXISTS core_tenants_set_updated_at ON core.tenants;
CREATE TRIGGER core_tenants_set_updated_at
  BEFORE UPDATE ON core.tenants
  FOR EACH ROW
  EXECUTE FUNCTION core.set_updated_at();

-- -----------------------------------------------------------------
-- Identity and advertisers
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS core.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email CITEXT NOT NULL,
  password_hash TEXT,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'invited'
    CHECK (status IN ('active', 'invited', 'disabled')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS core_users_email_active_uq
  ON core.users (tenant_id, email)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS core_users_tenant_status_idx
  ON core.users (tenant_id, status);

DROP TRIGGER IF EXISTS core_users_set_updated_at ON core.users;
CREATE TRIGGER core_users_set_updated_at
  BEFORE UPDATE ON core.users
  FOR EACH ROW
  EXECUTE FUNCTION core.set_updated_at();

CREATE TABLE IF NOT EXISTS core.advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES core.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  external_partner_id TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'inactive', 'blocked')),
  billing_customer_id TEXT,
  default_currency CHAR(3) NOT NULL DEFAULT 'USD',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS core_advertisers_external_partner_uq
  ON core.advertisers (tenant_id, external_partner_id)
  WHERE external_partner_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS core_advertisers_tenant_status_idx
  ON core.advertisers (tenant_id, status);

DROP TRIGGER IF EXISTS core_advertisers_set_updated_at ON core.advertisers;
CREATE TRIGGER core_advertisers_set_updated_at
  BEFORE UPDATE ON core.advertisers
  FOR EACH ROW
  EXECUTE FUNCTION core.set_updated_at();

-- -----------------------------------------------------------------
-- Campaigns and placements
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS core.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES core.advertisers(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  objective TEXT NOT NULL
    CHECK (objective IN ('cpc', 'cpl', 'cpm')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  daily_budget NUMERIC(12,2) CHECK (daily_budget IS NULL OR daily_budget >= 0),
  lifetime_budget NUMERIC(12,2) CHECK (lifetime_budget IS NULL OR lifetime_budget >= 0),
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  targeting_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT core_campaigns_date_window_chk
    CHECK (end_at IS NULL OR start_at IS NULL OR end_at >= start_at),
  CONSTRAINT core_campaigns_id_advertiser_uq UNIQUE (id, advertiser_id)
);

CREATE INDEX IF NOT EXISTS core_campaigns_tenant_status_created_idx
  ON core.campaigns (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS core_campaigns_advertiser_status_idx
  ON core.campaigns (advertiser_id, status);
CREATE INDEX IF NOT EXISTS core_campaigns_targeting_gin_idx
  ON core.campaigns USING GIN (targeting_json);

DROP TRIGGER IF EXISTS core_campaigns_set_updated_at ON core.campaigns;
CREATE TRIGGER core_campaigns_set_updated_at
  BEFORE UPDATE ON core.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION core.set_updated_at();

CREATE TABLE IF NOT EXISTS core.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES core.campaigns(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES core.advertisers(id) ON DELETE RESTRICT,
  placement_key TEXT NOT NULL,
  channel TEXT NOT NULL
    CHECK (channel IN ('web', 'search', 'social', 'email', 'partner')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'ended')),
  bid_amount NUMERIC(12,4) CHECK (bid_amount IS NULL OR bid_amount >= 0),
  bidding_strategy TEXT,
  constraints_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT core_placements_campaign_advertiser_fk_chk
    FOREIGN KEY (campaign_id, advertiser_id)
    REFERENCES core.campaigns (id, advertiser_id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS core_placements_campaign_key_uq
  ON core.placements (campaign_id, placement_key)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS core_placements_tenant_status_idx
  ON core.placements (tenant_id, status);
CREATE INDEX IF NOT EXISTS core_placements_channel_idx
  ON core.placements (channel);
CREATE INDEX IF NOT EXISTS core_placements_constraints_gin_idx
  ON core.placements USING GIN (constraints_json);

DROP TRIGGER IF EXISTS core_placements_set_updated_at ON core.placements;
CREATE TRIGGER core_placements_set_updated_at
  BEFORE UPDATE ON core.placements
  FOR EACH ROW
  EXECUTE FUNCTION core.set_updated_at();

-- -----------------------------------------------------------------
-- Leads lifecycle
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS core.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  advertiser_id UUID REFERENCES core.advertisers(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES core.campaigns(id) ON DELETE SET NULL,
  placement_id UUID REFERENCES core.placements(id) ON DELETE SET NULL,
  source TEXT NOT NULL
    CHECK (source IN ('web', 'api', 'partner', 'import')),
  contact_name TEXT,
  contact_email CITEXT,
  service_category TEXT,
  intent_score INTEGER CHECK (intent_score BETWEEN 0 AND 100),
  qualification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (qualification_status IN ('pending', 'qualified', 'rejected')),
  lead_status TEXT NOT NULL DEFAULT 'new'
    CHECK (lead_status IN ('new', 'evaluated', 'dispatched', 'closed')),
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  normalized_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS core_leads_tenant_status_created_idx
  ON core.leads (tenant_id, lead_status, created_at DESC);
CREATE INDEX IF NOT EXISTS core_leads_tenant_qualification_idx
  ON core.leads (tenant_id, qualification_status);
CREATE INDEX IF NOT EXISTS core_leads_campaign_idx
  ON core.leads (campaign_id);
CREATE INDEX IF NOT EXISTS core_leads_placement_idx
  ON core.leads (placement_id);
CREATE INDEX IF NOT EXISTS core_leads_normalized_payload_gin_idx
  ON core.leads USING GIN (normalized_payload);

DROP TRIGGER IF EXISTS core_leads_set_updated_at ON core.leads;
CREATE TRIGGER core_leads_set_updated_at
  BEFORE UPDATE ON core.leads
  FOR EACH ROW
  EXECUTE FUNCTION core.set_updated_at();

-- -----------------------------------------------------------------
-- Subscription and invoicing mirror
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS core.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  advertiser_id UUID REFERENCES core.advertisers(id) ON DELETE SET NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  plan_tier TEXT NOT NULL,
  status TEXT NOT NULL,
  billing_interval TEXT NOT NULL
    CHECK (billing_interval IN ('month', 'year')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT core_subscriptions_period_window_chk
    CHECK (
      current_period_end IS NULL
      OR current_period_start IS NULL
      OR current_period_end >= current_period_start
    )
);

CREATE INDEX IF NOT EXISTS core_subscriptions_tenant_status_idx
  ON core.subscriptions (tenant_id, status);
CREATE INDEX IF NOT EXISTS core_subscriptions_advertiser_status_idx
  ON core.subscriptions (advertiser_id, status)
  WHERE advertiser_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS core_subscriptions_one_active_per_tenant_plan_uq
  ON core.subscriptions (tenant_id, plan_tier)
  WHERE status IN ('trialing', 'active', 'past_due', 'unpaid');

DROP TRIGGER IF EXISTS core_subscriptions_set_updated_at ON core.subscriptions;
CREATE TRIGGER core_subscriptions_set_updated_at
  BEFORE UPDATE ON core.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION core.set_updated_at();

CREATE TABLE IF NOT EXISTS core.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  advertiser_id UUID REFERENCES core.advertisers(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES core.subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  amount_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT core_invoices_amounts_chk
    CHECK (amount_due >= 0 AND amount_paid >= 0)
);

CREATE INDEX IF NOT EXISTS core_invoices_tenant_status_due_idx
  ON core.invoices (tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS core_invoices_subscription_idx
  ON core.invoices (subscription_id);
CREATE INDEX IF NOT EXISTS core_invoices_advertiser_idx
  ON core.invoices (advertiser_id);

DROP TRIGGER IF EXISTS core_invoices_set_updated_at ON core.invoices;
CREATE TRIGGER core_invoices_set_updated_at
  BEFORE UPDATE ON core.invoices
  FOR EACH ROW
  EXECUTE FUNCTION core.set_updated_at();
