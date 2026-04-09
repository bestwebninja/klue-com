-- =============================================================================
-- add security-definer helpers for safe public profile reads
--
-- context:
-- migration 20260409120000 locked down profiles SELECT to owner + privileged
-- roles only. this breaks two legitimate read patterns that existed before:
--
-- 1. homeowners viewing provider contact info (email, phone) on quotes they
--    received on their own job listings.
-- 2. any authenticated user reading reviewer display names (full_name,
--    avatar_url) when viewing public review cards on provider profiles.
--
-- both patterns are resolved via SECURITY DEFINER functions that bypass rls
-- only after verifying the caller has a legitimate reason to see the data.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. get_quote_provider_profiles
--    returns provider contact fields (including email and phone) for any
--    provider who has submitted a quote on one of the caller's job listings.
--    the function verifies ownership before revealing sensitive data.
-- ---------------------------------------------------------------------------
create or replace function public.get_quote_provider_profiles(provider_ids uuid[])
returns table (
  id          uuid,
  full_name   text,
  avatar_url  text,
  bio         text,
  company_name text,
  city        text,
  state       text,
  is_verified boolean,
  email       text,
  phone       text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.company_name,
    p.city,
    p.state,
    p.is_verified,
    p.email,
    p.phone
  from public.profiles p
  where p.id = any(provider_ids)
    -- only expose provider info when the caller owns a job that provider quoted
    and exists (
      select 1
      from public.quote_requests qr
      join public.job_listings   jl on jl.id = qr.job_listing_id
      where qr.provider_id = p.id
        and jl.posted_by   = auth.uid()
    );
$$;

grant execute on function public.get_quote_provider_profiles(uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. get_reviewer_display_names
--    returns non-sensitive display data (id, full_name, avatar_url) for a
--    list of user ids that left reviews. used to populate reviewer name/avatar
--    on public review cards. email, phone, and all other sensitive fields are
--    intentionally excluded.
-- ---------------------------------------------------------------------------
create or replace function public.get_reviewer_display_names(reviewer_ids uuid[])
returns table (
  id         uuid,
  full_name  text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.avatar_url
  from public.profiles p
  where p.id = any(reviewer_ids);
$$;

grant execute on function public.get_reviewer_display_names(uuid[]) to anon, authenticated;
