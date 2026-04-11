# Partners Dashboard Main Audit (2026-04-11)

## Scope Reviewed
- Partner signup route and page in web app.
- Footer CTA wiring for partners signup.
- Existing admin role checks and route guard patterns.
- Existing Supabase query/mutation style and privileged handler pattern.
- Partner-related schema and RLS/storage controls in latest migration.

## Findings

### Already present in current main
- `/partners/signup` route is registered in `src/App.tsx` and points to `PartnerSignup`.
- Partner signup page exists and submits to `submit-partner-signup` edge function.
- Footer includes Partner SIGNUP CTAs pointing to `/partners/signup`.
- Admin-only partners dashboard route exists at `/admin/partners`.
- Admin role guard pattern uses `useAuth` + `useAdmin` and redirect behavior.
- Supabase React Query patterns already used in `usePartnersAdmin.ts`.
- Privileged writes use edge function `admin-partner-actions` with service role and admin checks.
- Partner admin migration exists (`20260411100000_partner_admin_dashboard.sql`) creating tables, RLS, storage buckets/policies, and cross-reference function.

### Gaps addressed in this change
- Extended list filters to include feed type, risk score minimum, preferred requested, expiring document flag, and linked contractor toggles.
- Tightened partner list query shape to include document expiry data for expiry warnings.
- Extended compliance tab to surface territory/feed/preferred transparency chips.
- Added support in admin privileged handler to edit existing internal notes (note_id path) in addition to create.
- Added SQL verification checklist for admin authorization and RLS protections on partner objects.

## Notes
- This implementation reuses existing signup and partner schema instead of duplicating route/page flows.
- Sensitive writes remain server-authoritative through edge functions.
