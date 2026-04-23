-- Lightweight Kluje-first janitorial subscription records
-- Shopify handles hosted payment; Kluje owns plan/status/access truth

create type public.janitorial_payment_path as enum ('ach_wire', 'shopify_online');

create type public.janitorial_subscription_status as enum (
  'pending',
  'awaiting_wire',
  'active',
  'canceled',
  'past_due',
  'failed'
);

create type public.janitorial_billing_cycle as enum (
  'monthly',
  'annual',
  'annual_veteran'
);

create type public.janitorial_plan as enum (
  'starter',
  'professional',
  'growth'
);

create table public.janitorial_subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  -- optional workspace/company linkage (freeform slug until a workspaces table exists)
  company_name          text,
  workspace_id          uuid,
  plan                  public.janitorial_plan not null,
  billing_cycle         public.janitorial_billing_cycle not null,
  payment_path          public.janitorial_payment_path not null,
  status                public.janitorial_subscription_status not null default 'pending',
  -- lightweight Shopify reference — set when the hosted checkout URL is generated
  shopify_checkout_ref  text,
  -- set when Kluje confirms the Shopify order (future webhook)
  shopify_order_ref     text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger janitorial_subscriptions_updated_at
  before update on public.janitorial_subscriptions
  for each row execute function public.set_updated_at();

-- Index for user lookups and admin queries
create index janitorial_subscriptions_user_id_idx on public.janitorial_subscriptions(user_id);
create index janitorial_subscriptions_status_idx on public.janitorial_subscriptions(status);
create index janitorial_subscriptions_payment_path_idx on public.janitorial_subscriptions(payment_path);

-- RLS: users can read/insert their own records; admins can read all
alter table public.janitorial_subscriptions enable row level security;

create policy "users can read own subscriptions"
  on public.janitorial_subscriptions for select
  using (auth.uid() = user_id);

create policy "users can insert own subscriptions"
  on public.janitorial_subscriptions for insert
  with check (auth.uid() = user_id);

-- Admins bypass RLS via service role (used by edge function + admin dashboard).
-- A separate admin-check policy would require a roles table — use service role for now.
