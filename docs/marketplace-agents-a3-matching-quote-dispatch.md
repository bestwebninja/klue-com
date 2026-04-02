# A3 Matching & Quote Dispatch (v1)

## Mission
Filter providers and issue quote requests with deterministic ranking.

## Rules-first behavior
- Hard filters: category match, geo coverage, active status, budget envelope.
- Rank inputs: provider weight, SLA hours, compliance freshness.
- Dispatch top-N with capped retries via n8n.

## Dependencies
- Existing routing and quote-request modules in `apps/api/src/services/routing`.

## AI/ML hook
- Add learned conversion uplift score as optional ranking feature.
