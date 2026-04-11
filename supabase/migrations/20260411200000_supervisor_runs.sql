-- Neural Command OS: supervisor runs table
-- Tracks multi-agent orchestration sessions (intent → routing plan → synthesis)

create table if not exists public.supervisor_runs (
  id                uuid primary key default gen_random_uuid(),
  business_unit_id  uuid references public.business_units(id) on delete cascade,
  query             text not null,
  intent            text,
  routing_plan      jsonb not null default '[]'::jsonb,
  agent_run_ids     jsonb not null default '[]'::jsonb,
  agent_outputs     jsonb not null default '{}'::jsonb,
  synthesis         jsonb,
  status            text not null default 'running'
                      check (status in ('running','succeeded','partial','failed')),
  error_message     text,
  model             text,
  created_by        uuid references auth.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists supervisor_runs_business_unit_idx
  on public.supervisor_runs(business_unit_id, created_at desc);

comment on table public.supervisor_runs is
  'Records Neural Command OS supervisor sessions: NL query → intent classification → agent routing → synthesis';
comment on column public.supervisor_runs.routing_plan is
  'Array of stages: [{stage, agentKeys, mode:"parallel"|"sequential", rationale}]';
comment on column public.supervisor_runs.agent_outputs is
  'Map of agentKey → output payload from each invoked agent';
comment on column public.supervisor_runs.synthesis is
  'Unified summary produced by the synthesis step: {narrative, actions, nudges, confidence}';

-- RLS
alter table public.supervisor_runs enable row level security;

create policy "business unit members can read supervisor runs"
  on public.supervisor_runs for select
  using (
    business_unit_id in (
      select business_unit_id from public.business_unit_members where user_id = auth.uid()
    )
  );

create policy "service role full access supervisor runs"
  on public.supervisor_runs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
