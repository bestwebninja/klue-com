# Partner signup main-branch audit + upgrade notes (2026-04-11)

## Main audit baseline
- Verified `/partners/signup` route exists in `src/App.tsx` and is wired to `PartnerSignup`.
- Verified footer already links users into `/partners/signup` from partner CTA entries.
- Verified the existing signup flow in `src/pages/PartnerSignup.tsx` was a lightweight 3-step intake.
- Verified `submit-partner-signup` edge function inserted a minimal subset of partner records and did not populate the broader onboarding-related tables added in partner admin schema.

## Upgrade goals applied
- Replaced the basic 3-step form with a full multi-step onboarding intake covering organization, business profile, operations, compliance, campaign, and review.
- Expanded payload sent to `submit-partner-signup` to include entity details, territory/feed settings, category selection, and compliance information.
- Extended `submit-partner-signup` persistence to write to partner-related records used by downstream admin workflows (`partner_addresses`, `partner_territories`, `partner_categories`, `partner_verifications`, `partner_license_records`, `partner_insurance_records`, `partner_feed_connections`, and `preferred_partner_applications`).
