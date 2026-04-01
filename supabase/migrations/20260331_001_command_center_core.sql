create type public.command_center_audience as enum ('trade','finance','title');
create type public.command_center_trade as enum ('plumbing','electrical','hvac','roofing','remodeling','finishing','landscaping','windows_doors');
create type public.command_center_business_focus as enum ('service_repair','new_build','mixed');
create type public.command_center_dashboard_status as enum ('draft','active','archived');
create type public.command_center_alert_severity as enum ('low','medium','high');
create type public.command_center_agent_run_status as enum ('queued','running','succeeded','failed');
create type public.command_center_integration_provider as enum ('weather','maps','retailer','finance','insurance','property_data','esign','biometrics');
create type public.command_center_document_kind as enum ('quote','permit','draw_request','title_commitment','closing_disclosure','inspection','other');

create table if not exists public.business_units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.business_unit_members (
  id uuid primary key default gen_random_uuid(),
  business_unit_id uuid not null references public.business_units(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (business_unit_id, user_id)
);
create table if not exists public.dashboard_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  audience public.command_center_audience not null,
  trade public.command_center_trade,
  version text not null,
  name text not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.dashboard_instances (
  id uuid primary key default gen_random_uuid(),
  business_unit_id uuid not null references public.business_units(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  template_key text not null references public.dashboard_templates(template_key),
  audience public.command_center_audience not null,
  trade public.command_center_trade,
  status public.command_center_dashboard_status not null default 'active',
  is_default boolean not null default false,
  config_overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists dashboard_instances_default_unique on public.dashboard_instances(owner_user_id) where is_default;
create table if not exists public.trade_profiles (id uuid primary key default gen_random_uuid(), business_unit_id uuid not null unique references public.business_units(id) on delete cascade, primary_trade public.command_center_trade not null, business_focus public.command_center_business_focus not null, typical_job_size text, veteran_owned boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.command_center_jobs (id uuid primary key default gen_random_uuid(), business_unit_id uuid not null references public.business_units(id) on delete cascade, payload jsonb not null default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.command_center_quotes (id uuid primary key default gen_random_uuid(), business_unit_id uuid not null references public.business_units(id) on delete cascade, payload jsonb not null default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.command_center_alerts (id uuid primary key default gen_random_uuid(), business_unit_id uuid not null references public.business_units(id) on delete cascade, severity public.command_center_alert_severity not null, title text not null, detail text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz default now());
create table if not exists public.ai_agents (id uuid primary key default gen_random_uuid(), agent_key text unique not null, name text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz default now());
create table if not exists public.ai_agent_runs (id uuid primary key default gen_random_uuid(), business_unit_id uuid references public.business_units(id) on delete cascade, agent_key text not null references public.ai_agents(agent_key), status public.command_center_agent_run_status not null default 'queued', input_payload jsonb not null default '{}'::jsonb, output_payload jsonb, error_message text, created_by uuid references auth.users(id), created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.documents (id uuid primary key default gen_random_uuid(), business_unit_id uuid not null references public.business_units(id) on delete cascade, kind public.command_center_document_kind not null, title text not null, storage_path text, metadata jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.document_entities (id uuid primary key default gen_random_uuid(), document_id uuid not null references public.documents(id) on delete cascade, entity_type text not null, entity_value text not null, confidence numeric(5,4), created_at timestamptz default now());
create table if not exists public.risk_scores (id uuid primary key default gen_random_uuid(), business_unit_id uuid not null references public.business_units(id) on delete cascade, score numeric(5,2) not null, factors jsonb default '{}'::jsonb, created_at timestamptz default now());
create table if not exists public.benchmark_snapshots (id uuid primary key default gen_random_uuid(), business_unit_id uuid not null references public.business_units(id) on delete cascade, metric_key text not null, metric_value numeric(12,2), captured_at timestamptz default now(), unique (business_unit_id, metric_key, captured_at));
create table if not exists public.simulations (id uuid primary key default gen_random_uuid(), business_unit_id uuid not null references public.business_units(id) on delete cascade, input jsonb not null, output jsonb not null, created_by uuid references auth.users(id), created_at timestamptz default now());
create table if not exists public.integration_connections (id uuid primary key default gen_random_uuid(), business_unit_id uuid not null references public.business_units(id) on delete cascade, provider public.command_center_integration_provider not null, status text not null default 'mock', config jsonb not null default '{}'::jsonb, secret_ref text, created_at timestamptz default now(), updated_at timestamptz default now(), unique (business_unit_id, provider));
