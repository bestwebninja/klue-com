create or replace function public.resolve_default_dashboard_instance(target_user uuid)
returns public.dashboard_instances language sql stable security definer set search_path = public as $$
  select * from public.dashboard_instances di where di.owner_user_id = target_user and di.is_default = true order by di.created_at desc limit 1;
$$;
