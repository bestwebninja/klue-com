create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create or replace function public.is_business_unit_member(target_business_unit uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.business_unit_members bum where bum.business_unit_id = target_business_unit and bum.user_id = auth.uid());
$$;

alter table public.business_units enable row level security;
alter table public.business_unit_members enable row level security;
alter table public.dashboard_instances enable row level security;
alter table public.trade_profiles enable row level security;
alter table public.command_center_jobs enable row level security;
alter table public.command_center_quotes enable row level security;
alter table public.command_center_alerts enable row level security;
alter table public.ai_agent_runs enable row level security;
alter table public.documents enable row level security;
alter table public.risk_scores enable row level security;
alter table public.benchmark_snapshots enable row level security;
alter table public.simulations enable row level security;
alter table public.integration_connections enable row level security;

create policy cc_member_access_business_units on public.business_units using (public.is_business_unit_member(id)) with check (owner_user_id = auth.uid());
create policy cc_member_access_members on public.business_unit_members using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));

create policy cc_member_access_dashboard_instances on public.dashboard_instances using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));
create policy cc_member_access_trade_profiles on public.trade_profiles using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));
create policy cc_member_access_jobs on public.command_center_jobs using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));
create policy cc_member_access_quotes on public.command_center_quotes using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));
create policy cc_member_access_alerts on public.command_center_alerts using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));
create policy cc_member_access_agent_runs on public.ai_agent_runs using (business_unit_id is null or public.is_business_unit_member(business_unit_id)) with check (business_unit_id is null or public.is_business_unit_member(business_unit_id));
create policy cc_member_access_documents on public.documents using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));
create policy cc_member_access_risk_scores on public.risk_scores using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));
create policy cc_member_access_benchmarks on public.benchmark_snapshots using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));
create policy cc_member_access_simulations on public.simulations using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));
create policy cc_member_access_integrations on public.integration_connections using (public.is_business_unit_member(business_unit_id)) with check (public.is_business_unit_member(business_unit_id));

create trigger set_updated_business_units before update on public.business_units for each row execute function public.set_updated_at();
create trigger set_updated_dashboard_templates before update on public.dashboard_templates for each row execute function public.set_updated_at();
create trigger set_updated_dashboard_instances before update on public.dashboard_instances for each row execute function public.set_updated_at();
create trigger set_updated_trade_profiles before update on public.trade_profiles for each row execute function public.set_updated_at();
create trigger set_updated_jobs before update on public.command_center_jobs for each row execute function public.set_updated_at();
create trigger set_updated_quotes before update on public.command_center_quotes for each row execute function public.set_updated_at();
create trigger set_updated_ai_agent_runs before update on public.ai_agent_runs for each row execute function public.set_updated_at();
create trigger set_updated_documents before update on public.documents for each row execute function public.set_updated_at();
create trigger set_updated_integration_connections before update on public.integration_connections for each row execute function public.set_updated_at();
