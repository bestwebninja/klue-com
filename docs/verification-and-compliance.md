# Verification and Compliance Workflow

This document describes the provider trust workflow added to `apps/api`, including verification requests, document intake, admin decisions, and compliance flagging.

## Database model

New tables in `infra/db/schema.sql`:

- `verification_requests`: lifecycle state (`pending`, `approved`, `rejected`, `needs_more_info`) and requester/reviewer metadata.
- `verification_documents`: uploaded verification document metadata (URL, checksum, status, and arbitrary metadata).
- `verification_events`: immutable audit trail for lifecycle events.
- `compliance_flags`: compliance and risk flags tied to providers and optionally to verification requests.

Indexes are included for provider/request status lookup and timeline queries.

## API endpoints

Added OpenAPI contracts and route implementations:

- `POST /api/v1/verification/start`
  - Creates a verification request and appends a `verification_started` audit event.
- `POST /api/v1/verification/documents`
  - Stores document metadata and appends `document_uploaded` audit event.
- `GET /api/v1/verification/{providerId}/status`
  - Returns latest request, uploaded docs, compliance flags, and full audit event stream.
- `POST /api/v1/admin/verification/{requestId}/decision`
  - Admin-only decision endpoint (`approved`, `rejected`, `needs_more_info`).
  - Always appends a `decision_recorded` event.
  - Creates a compliance flag plus `compliance_flag_created` event for non-approved outcomes.

## Area-risk compliance flag extension

`POST /api/v1/area-risk/score` now includes:

- `compliance_flags` in the response for downstream compliance automation.
- Optional compliance-flag persistence when `context.providerId` is passed and risk/suppression/block conditions are met.

Flag generation rules:

- `blocked` -> `area_risk_mosaicing_blocked` (`critical`)
- `suppressed` -> `area_risk_suppressed` (`warning`)
- `ok` + high band -> `area_risk_high_band` (`warning`)

## Persistence strategy

The service layer (`verification-store`) uses:

- In-memory maps as the source of truth for local/dev runtime.
- Best-effort Supabase persistence (`verification_requests`, `verification_documents`, `verification_events`, `compliance_flags`) when service-role credentials are configured.

This matches existing patterns used by routing persistence.

## n8n workflow templates

Added templates in `n8n/workflows`:

- `verification-compliance-notifications.json`: webhook-triggered decision/compliance notifications.
- `verification-document-reminders.json`: scheduled reminders for pending verification docs.
