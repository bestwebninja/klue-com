-- Partner signup persistence + admin dashboard foundation
create extension if not exists pgcrypto;

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  partner_id text generated always as ('PTR-' || upper(substring(replace(id::text, '-', ''), 1, 10))) stored unique,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  partner_type text not null,
  entity_type text,
  offer_type text,
  legal_business_name text not null,
  dba_name text,
  contact_name text,
  email text,
  phone text,
  website text,
  state text,
  city text,
  zip text,
  primary_territory text,
  verification_tier text not null default 'tier-0',
  compliance_status text not null default 'pending',
  lifecycle_status text not null default 'submitted',
  preferred_territory_status text not null default 'not_requested',
  feed_status text not null default 'not_connected',
  risk_score numeric(5,2) not null default 0,
  preferred_requested boolean not null default false,
  feed_type text,
  campaign_goals text,
  launch_timeline text,
  target_markets text,
  status text not null default 'submitted',
  source text not null default 'partner_signup',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_contacts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  contact_type text not null default 'primary',
  name text not null,
  email text,
  phone text,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_addresses (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  address_type text not null default 'headquarters',
  line1 text,
  line2 text,
  city text,
  state text,
  zip text,
  country text default 'US',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_territories (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  territory_label text not null,
  territory_state text,
  territory_city text,
  territory_zip text,
  is_primary boolean not null default false,
  is_preferred boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_categories (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  category text not null,
  source text default 'signup',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_documents (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  document_type text not null,
  storage_bucket text not null default 'partner-verification-docs',
  storage_path text not null,
  status text not null default 'uploaded',
  expires_at date,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_verifications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  identity_verified boolean not null default false,
  business_verified boolean not null default false,
  license_verified boolean not null default false,
  insurance_verified boolean not null default false,
  verification_tier text not null default 'tier-0',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id)
);

create table if not exists public.partner_license_records (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  license_number text,
  issuing_state text,
  status text not null default 'pending',
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_insurance_records (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  carrier_name text,
  policy_number text,
  status text not null default 'pending',
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_feed_connections (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  feed_type text not null,
  connection_status text not null default 'pending',
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contractor_partner_links (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  contractor_id uuid not null references public.profiles(id) on delete cascade,
  territory_match_score numeric(5,2) not null default 0,
  category_match_score numeric(5,2) not null default 0,
  compliance_match_score numeric(5,2) not null default 0,
  fulfillment_match_score numeric(5,2) not null default 0,
  quality_score numeric(5,2) not null default 0,
  preferred_partner_weight numeric(5,2) not null default 0,
  match_score numeric(5,2) generated always as (
    ((territory_match_score * 0.20)
      + (category_match_score * 0.20)
      + (compliance_match_score * 0.20)
      + (fulfillment_match_score * 0.20)
      + (quality_score * 0.15)
      + (preferred_partner_weight * 0.05))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, contractor_id)
);

create table if not exists public.partner_audit_log (
  id bigint generated by default as identity primary key,
  partner_id uuid not null references public.partners(id) on delete cascade,
  action text not null,
  actor_id uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.preferred_partner_applications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  request_notes text,
  status text not null default 'under_review',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_internal_notes (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partners_status_idx on public.partners(status);
create index if not exists partners_partner_type_idx on public.partners(partner_type);
create index if not exists partners_compliance_status_idx on public.partners(compliance_status);
create index if not exists partners_preferred_status_idx on public.partners(preferred_territory_status);
create index if not exists partners_created_at_idx on public.partners(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_partners_updated_at on public.partners;
create trigger set_partners_updated_at before update on public.partners for each row execute function public.set_updated_at();

do $$
declare
  t text;
begin
  foreach t in array array['partner_contacts','partner_addresses','partner_territories','partner_categories','partner_documents','partner_verifications','partner_license_records','partner_insurance_records','partner_feed_connections','contractor_partner_links','preferred_partner_applications','partner_internal_notes']
  loop
    execute format('drop trigger if exists set_%s_updated_at on public.%s', t, t);
    execute format('create trigger set_%s_updated_at before update on public.%s for each row execute function public.set_updated_at()', t, t);
  end loop;
end;
$$;

alter table public.partners enable row level security;
alter table public.partner_contacts enable row level security;
alter table public.partner_addresses enable row level security;
alter table public.partner_territories enable row level security;
alter table public.partner_categories enable row level security;
alter table public.partner_documents enable row level security;
alter table public.partner_verifications enable row level security;
alter table public.partner_license_records enable row level security;
alter table public.partner_insurance_records enable row level security;
alter table public.partner_feed_connections enable row level security;
alter table public.contractor_partner_links enable row level security;
alter table public.partner_audit_log enable row level security;
alter table public.preferred_partner_applications enable row level security;
alter table public.partner_internal_notes enable row level security;

-- Partner signup visibility
create policy "Admins can view partners"
on public.partners for select
using (public.has_role(auth.uid(), 'admin'::public.app_role));

create policy "Applicants can view own partner submissions"
on public.partners for select
using (created_by = auth.uid());

create policy "Applicants can insert own partner submissions"
on public.partners for insert
with check (created_by = auth.uid());

create policy "Admins can manage partners"
on public.partners for all
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Admin-only tables
DO $$
declare
  tbl text;
begin
  foreach tbl in array array['partner_contacts','partner_addresses','partner_territories','partner_categories','partner_documents','partner_verifications','partner_license_records','partner_insurance_records','partner_feed_connections','contractor_partner_links','partner_audit_log','preferred_partner_applications','partner_internal_notes']
  loop
    execute format('create policy "Admins can manage %s" on public.%s for all using (public.has_role(auth.uid(), ''admin''::public.app_role)) with check (public.has_role(auth.uid(), ''admin''::public.app_role));', tbl, tbl);
  end loop;
end;
$$;

-- Storage: keep sensitive files private and admin controlled
insert into storage.buckets (id, name, public)
values ('partner-verification-docs', 'partner-verification-docs', false)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('partner-admin-attachments', 'partner-admin-attachments', false)
on conflict (id) do update set public = excluded.public;

create policy "Admins can access partner verification docs"
on storage.objects for all
using (
  bucket_id = 'partner-verification-docs'
  and public.has_role(auth.uid(), 'admin'::public.app_role)
)
with check (
  bucket_id = 'partner-verification-docs'
  and public.has_role(auth.uid(), 'admin'::public.app_role)
);

create policy "Admins can access partner admin attachments"
on storage.objects for all
using (
  bucket_id = 'partner-admin-attachments'
  and public.has_role(auth.uid(), 'admin'::public.app_role)
)
with check (
  bucket_id = 'partner-admin-attachments'
  and public.has_role(auth.uid(), 'admin'::public.app_role)
);

create or replace function public.refresh_partner_contractor_links(target_partner_id uuid default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer;
begin
  delete from public.contractor_partner_links
  where target_partner_id is null or partner_id = target_partner_id;

  insert into public.contractor_partner_links (
    partner_id,
    contractor_id,
    territory_match_score,
    category_match_score,
    compliance_match_score,
    fulfillment_match_score,
    quality_score,
    preferred_partner_weight
  )
  select
    p.id,
    pr.id,
    case when lower(coalesce(pr.state, '')) = lower(coalesce(p.state, '')) then 100 else 30 end,
    55,
    case when p.compliance_status in ('approved', 'compliant') then 95 else 45 end,
    60,
    case when pr.is_verified then 90 else 60 end,
    case when p.preferred_territory_status = 'approved' then 100 else 25 end
  from public.partners p
  join public.profiles pr on true
  join public.user_roles ur on ur.user_id = pr.id and ur.role = 'provider'
  where target_partner_id is null or p.id = target_partner_id;

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

grant execute on function public.refresh_partner_contractor_links(uuid) to service_role;
