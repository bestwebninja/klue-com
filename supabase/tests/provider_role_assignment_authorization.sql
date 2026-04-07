-- Manual SQL verification for provider role assignment hardening.
-- Run in a Supabase/Postgres session after migrations are applied.
--
-- Expected outcomes:
-- 1) Normal authenticated user cannot self-assign provider via RPC.
-- 2) Admin can grant provider to another user.
-- 3) Service role can grant provider to another user.

-- 1) Non-admin authenticated should fail:
-- select set_config('request.jwt.claim.role', 'authenticated', true);
-- select set_config('request.jwt.claim.sub', '<non_admin_user_uuid>', true);
-- select public.assign_provider_role('<non_admin_user_uuid>'::uuid);
-- -- expect: ERROR: Insufficient privileges to assign provider role

-- 2) Admin authenticated should succeed:
-- select set_config('request.jwt.claim.role', 'authenticated', true);
-- select set_config('request.jwt.claim.sub', '<admin_user_uuid>', true);
-- select public.assign_provider_role('<target_user_uuid>'::uuid);
-- select 1
-- from public.user_roles
-- where user_id = '<target_user_uuid>'::uuid and role = 'provider'::public.app_role;
-- -- expect: one row

-- 3) Service role should succeed:
-- select set_config('request.jwt.claim.role', 'service_role', true);
-- select public.assign_provider_role('<target_user_uuid>'::uuid);
-- -- expect: no error
