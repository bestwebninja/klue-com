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
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  timeline TEXT,
  requirements_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  scope_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  attachments_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  intake_status TEXT NOT NULL DEFAULT 'pending' CHECK (intake_status IN ('pending', 'in_review', 'needs_info', 'ready_for_routing')),
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

CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  external_ref TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'offboarded')),
  endpoint_url TEXT,
  ranking_weight NUMERIC(6,4) NOT NULL DEFAULT 0.5000,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, external_ref)
);

CREATE TABLE provider_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  service_category TEXT NOT NULL,
  min_budget NUMERIC(12,2),
  max_budget NUMERIC(12,2),
  coverage_zip_prefixes TEXT[] NOT NULL DEFAULT '{}',
  sla_hours INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider_id, service_category)
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

CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  run_id UUID NOT NULL REFERENCES routing_runs(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  service_category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'evaluated' CHECK (status IN ('evaluated', 'dispatched', 'partially_failed', 'completed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  quote_by_at TIMESTAMPTZ,
  reasoning JSONB NOT NULL DEFAULT '{}'::jsonb,
  outcomes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES routing_runs(id) ON DELETE CASCADE,
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  correlation_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'acknowledged', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
CREATE INDEX idx_providers_tenant_status ON providers (tenant_id, status);
CREATE INDEX idx_provider_capabilities_service_category ON provider_capabilities (service_category) WHERE active = true;
CREATE INDEX idx_quote_requests_tenant_requested_at ON quote_requests (tenant_id, requested_at DESC);
CREATE INDEX idx_dispatches_run_status ON dispatches (run_id, status);

CREATE TABLE expert_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  asked_by_user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'answered', 'closed', 'moderation_hold')),
  unsafe_advice_state TEXT NOT NULL DEFAULT 'none' CHECK (unsafe_advice_state IN ('none', 'suspected', 'confirmed', 'cleared')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expert_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  question_id UUID NOT NULL REFERENCES expert_questions(id) ON DELETE CASCADE,
  expert_user_id UUID REFERENCES users(id),
  body TEXT NOT NULL,
  citations TEXT[] NOT NULL DEFAULT '{}',
  unsafe_advice_state TEXT NOT NULL DEFAULT 'none' CHECK (unsafe_advice_state IN ('none', 'suspected', 'confirmed', 'cleared')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expert_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  question_id UUID NOT NULL REFERENCES expert_questions(id) ON DELETE CASCADE,
  expert_user_id UUID NOT NULL REFERENCES users(id),
  assigned_by_user_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
  target_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('approve', 'reject', 'flag', 'escalate', 'request_changes')),
  unsafe_advice_state TEXT NOT NULL DEFAULT 'none' CHECK (unsafe_advice_state IN ('none', 'suspected', 'confirmed', 'cleared')),
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  reviewed_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expert_questions_tenant_status_created_at ON expert_questions (tenant_id, status, created_at DESC);
CREATE INDEX idx_expert_answers_question_created_at ON expert_answers (question_id, created_at ASC);
CREATE INDEX idx_expert_assignments_expert_status ON expert_assignments (expert_user_id, status, created_at DESC);
CREATE INDEX idx_moderation_actions_target_created_at ON moderation_actions (target_type, target_id, created_at DESC);
