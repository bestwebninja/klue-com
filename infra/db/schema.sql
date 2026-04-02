CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  legal_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  industry TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  advertiser_id UUID NOT NULL REFERENCES advertisers(id),
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  daily_budget NUMERIC(12,2) NOT NULL,
  lifetime_budget NUMERIC(12,2),
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE campaign_targeting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  geo_json JSONB,
  categories TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  device_filters JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  surface TEXT NOT NULL,
  constraints JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  campaign_id UUID REFERENCES campaigns(id),
  source TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  location TEXT,
  service_category TEXT,
  intent_score NUMERIC(5,2),
  quality_score NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lead_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES advertisers(id),
  route_reason TEXT,
  rank_score NUMERIC(8,2),
  delivered_at TIMESTAMPTZ,
  response_status TEXT,
  UNIQUE (lead_id, advertiser_id)
);


CREATE TABLE routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  scope TEXT NOT NULL DEFAULT 'marketplace',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE routing_rule_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routing_rule_id UUID NOT NULL REFERENCES routing_rules(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  version_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'rolled_back')),
  definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  change_summary TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  UNIQUE (routing_rule_id, version_number)
);

CREATE TABLE routing_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  lead_id UUID REFERENCES leads(id),
  correlation_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'evaluated' CHECK (status IN ('evaluated', 'dispatched', 'failed')),
  dry_run BOOLEAN NOT NULL DEFAULT false,
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  rule_version_id UUID REFERENCES routing_rule_versions(id),
  decision_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES routing_runs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  correlation_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('provider', 'partner', 'queue')),
  target_ref TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'acknowledged', 'failed')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE routing_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES routing_runs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  correlation_id TEXT NOT NULL,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('candidate_selection', 'priority')),
  rule_id UUID REFERENCES routing_rules(id),
  rule_version_id UUID REFERENCES routing_rule_versions(id),
  outcome TEXT NOT NULL,
  score NUMERIC(8,2),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  advertiser_id UUID REFERENCES advertisers(id),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  amount_due NUMERIC(12,2),
  amount_paid NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  hosted_invoice_url TEXT,
  issued_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_tenant_created_at ON events (tenant_id, created_at DESC);
CREATE INDEX idx_leads_tenant_created_at ON leads (tenant_id, created_at DESC);
CREATE INDEX idx_campaigns_active ON campaigns (tenant_id, status) WHERE status = 'active';
CREATE INDEX idx_leads_unresolved ON leads (tenant_id, status) WHERE status IN ('new','routed');
CREATE INDEX idx_routing_rules_tenant_active ON routing_rules (tenant_id, is_active);
CREATE INDEX idx_routing_runs_tenant_created_at ON routing_runs (tenant_id, created_at DESC);
CREATE INDEX idx_routing_runs_correlation_id ON routing_runs (correlation_id);
CREATE INDEX idx_handoffs_run_status ON handoffs (run_id, status);
CREATE INDEX idx_routing_decisions_run_created_at ON routing_decisions (run_id, created_at DESC);
