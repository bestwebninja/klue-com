# Marketplace Job Intake and Scoping

This update extends the existing leads intake flow so lead records can carry structured scoping data from first submission through routing.

## Data model changes

`infra/db/schema.sql` extends the `leads` table with intake/scoping columns:

- `budget_min`, `budget_max`
- `timeline`
- `requirements_json`
- `scope_json`
- `attachments_json`
- `intake_status`

`intake_status` is constrained to:

- `pending`
- `in_review`
- `needs_info`
- `ready_for_routing`

## API contract updates

`apps/api/openapi.yaml` now describes:

- `POST /leads` with structured scoping payload fields
- `GET /leads/{leadId}` for lead retrieval
- shared request/response schemas for lead attachments, scope details, and missing-information placeholders

## API implementation notes

The leads route now includes:

1. **Zod validation** via `services/leads/schema.ts`.
2. **Normalization/enrichment hooks** via `services/leads/intake.ts`:
   - category canonicalization placeholder
   - location formatting placeholder
   - scope cleanup and enrichment notes
3. **Missing-information detection placeholders** for scope summary, timeline, phone, and budget.
4. **Intake scoring hook** that computes a deterministic 0-100 score to guide intake status.

## Shared types

`packages/shared/src/leads.ts` centralizes request/response types used by API handlers and other consumers.

## Tests

Validation tests for the new intake schema were added in:

- `apps/api/src/services/leads/schema.test.ts`

These cover:

- valid structured intake payload acceptance
- budget range guardrails (`budgetMax >= budgetMin`)
- scope summary minimum length
