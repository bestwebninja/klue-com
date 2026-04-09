-- tighten public.profiles select rls to owner + privileged internal roles

-- ensure support exists in the app_role enum for privileged support access
alter type public.app_role add value if not exists 'support';

-- drop broad/permissive select policies on profiles
-- (includes legacy policy names observed across prior migrations)
drop policy if exists "Users can view all profiles" on public.profiles;
drop policy if exists "Authenticated users can view all profiles" on public.profiles;
drop policy if exists "Authenticated users can view profiles" on public.profiles;
drop policy if exists "Authenticated users can view provider profiles" on public.profiles;
drop policy if exists "Authenticated users can view basic profile info" on public.profiles;
drop policy if exists "Users can only view own profile directly" on public.profiles;
drop policy if exists "Users can view own full profile" on public.profiles;
drop policy if exists "Privileged roles can view all profiles" on public.profiles;

-- owner-only full profile reads
create policy "Users can view own full profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- privileged reads for internal admin/support
create policy "Privileged roles can view all profiles"
on public.profiles
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  or public.has_role(auth.uid(), 'support'::public.app_role)
);
