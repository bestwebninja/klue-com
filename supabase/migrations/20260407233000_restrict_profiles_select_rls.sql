-- =============================================================================
-- restrict profiles select rls to owner + privileged internal roles
--
-- why this change:
-- previous policies allowed broad authenticated reads on public.profiles.
-- because profiles contains sensitive fields (for example email, phone,
-- suspension_reason, and account_status), that policy shape was unsafe.
--
-- what this migration enforces:
-- 1) only the profile owner can directly select their own row.
-- 2) privileged internal roles can select any profile row.
--
-- implementation notes:
-- - reuses the existing app_role + user_roles + has_role() authorization model.
-- - keeps policies granular (separate owner and privileged read paths).
-- - uses idempotent drops for legacy policy names observed in migration history.
-- =============================================================================

-- ensure the internal support role exists in the existing enum-based role model.
-- this is idempotent and safe to run multiple times.
alter type public.app_role add value if not exists 'support';

-- remove broad and duplicate profiles select policies.
drop policy if exists "Users can view all profiles" on public.profiles;
drop policy if exists "Authenticated users can view profiles" on public.profiles;
drop policy if exists "Authenticated users can view all profiles" on public.profiles;
drop policy if exists "Authenticated users can view provider profiles" on public.profiles;
drop policy if exists "Authenticated users can view basic profile info" on public.profiles;
drop policy if exists "Users can only view own profile directly" on public.profiles;
drop policy if exists "Users can view own full profile" on public.profiles;

-- owner-only direct reads from profiles (full row, including sensitive fields).
create policy "Users can view own full profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- privileged internal read path for admin + support.
create policy "Privileged roles can view all profiles"
on public.profiles
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  or public.has_role(auth.uid(), 'support'::public.app_role)
);
