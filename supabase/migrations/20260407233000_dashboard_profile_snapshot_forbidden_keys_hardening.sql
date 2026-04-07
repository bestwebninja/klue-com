-- Harden forbidden-key detection for dashboard_bootstraps.profile_snapshot
-- to explicitly reject moderation/account-status style keys.

create or replace function public.jsonb_contains_forbidden_profile_snapshot_keys(payload jsonb)
returns boolean
language sql
immutable
as $$
  with recursive walk(node) as (
    select coalesce(payload, '{}'::jsonb)
    union all
    select child.value
    from walk
    cross join lateral jsonb_each(walk.node) as child
    where jsonb_typeof(walk.node) = 'object'
    union all
    select item.value
    from walk
    cross join lateral jsonb_array_elements(walk.node) as item
    where jsonb_typeof(walk.node) = 'array'
  ), flattened_keys as (
    select lower(obj.key) as key_name
    from walk
    cross join lateral jsonb_each(walk.node) as obj
    where jsonb_typeof(walk.node) = 'object'
  )
  select exists (
    select 1
    from flattened_keys
    where
      key_name = any (
        array[
          'email',
          'phone',
          'phone_number',
          'mobile',
          'mobile_number',
          'subscription_status',
          'subscription',
          'subscription_expires_at',
          'stripe_customer_id',
          'stripe_customer',
          'stripe_id',
          'customer_id',
          'customer_identifier',
          'billing_email',
          'billing_address',
          'payment_method',
          'payment_last4',
          'account_status',
          'status',
          'suspension_reason',
          'suspended_at',
          'is_suspended',
          'moderation_notes',
          'admin_notes'
        ]
      )
      or key_name like 'stripe%'
      or key_name like '%stripe%'
      or key_name like 'customer%'
      or key_name like '%customer%'
      or key_name like 'billing%'
      or key_name like '%billing%'
      or key_name like 'payment%'
      or key_name like '%payment%'
      or key_name like '%suspend%'
      or key_name like '%moderat%'
      or key_name like '%account_status%'
  );
$$;

update public.dashboard_bootstraps
set profile_snapshot = public.sanitize_dashboard_profile_snapshot(profile_snapshot)
where profile_snapshot is distinct from public.sanitize_dashboard_profile_snapshot(profile_snapshot);

do $$
begin
  if not public.jsonb_contains_forbidden_profile_snapshot_keys('{"account_status":"restricted"}'::jsonb) then
    raise exception 'regression failure: account_status should be forbidden';
  end if;

  if not public.jsonb_contains_forbidden_profile_snapshot_keys('{"nested":{"suspension_reason":"fraud"}}'::jsonb) then
    raise exception 'regression failure: suspension_reason should be forbidden';
  end if;

  if public.jsonb_contains_forbidden_profile_snapshot_keys('{"full_name":"Alex","company_name":"Acme"}'::jsonb) then
    raise exception 'regression failure: allowlisted safe payload was flagged as forbidden';
  end if;
end;
$$;
