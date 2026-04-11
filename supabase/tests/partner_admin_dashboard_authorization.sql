-- Manual SQL verification for partner admin dashboard security and authorization.
-- Run after applying 20260411100000_partner_admin_dashboard.sql.

-- Expected outcomes:
-- 1) Authenticated non-admin cannot read private partner admin tables.
-- 2) Authenticated non-admin can only read own partner submissions.
-- 3) Admin can read/manage partner records and related admin tables.
-- 4) Non-admin cannot approve/reject by direct table update due to RLS.

-- 1) Non-admin visibility check (should return 0 rows unless created_by = caller):
-- select set_config('request.jwt.claim.role', 'authenticated', true);
-- select set_config('request.jwt.claim.sub', '<non_admin_user_uuid>', true);
-- select count(*) from public.partners;
-- select count(*) from public.partner_internal_notes;
-- select count(*) from public.partner_audit_log;

-- 2) Applicant can read own partner submissions only:
-- select set_config('request.jwt.claim.role', 'authenticated', true);
-- select set_config('request.jwt.claim.sub', '<applicant_user_uuid>', true);
-- select id, partner_id, created_by from public.partners;
-- -- expect: only rows where created_by = <applicant_user_uuid>

-- 3) Admin can read partner graph:
-- select set_config('request.jwt.claim.role', 'authenticated', true);
-- select set_config('request.jwt.claim.sub', '<admin_user_uuid>', true);
-- select count(*) from public.partners;
-- select count(*) from public.partner_internal_notes;
-- select count(*) from public.partner_audit_log;
-- select count(*) from public.contractor_partner_links;

-- 4) Non-admin direct mutation should fail:
-- select set_config('request.jwt.claim.role', 'authenticated', true);
-- select set_config('request.jwt.claim.sub', '<non_admin_user_uuid>', true);
-- update public.partners
-- set status = 'approved'
-- where id = '<partner_uuid>'::uuid;
-- -- expect: ERROR: new row violates row-level security policy
