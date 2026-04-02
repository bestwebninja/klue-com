# Provider Routing V1

## Scope
Provider Routing V1 adds scaffolding for provider discovery, candidate ranking, quote dispatch creation, and dispatch outcome tracking.

## Routing Flow
1. `POST /api/v1/routing/evaluate` classifies intent + user type.
2. Hard constraints are applied against provider capability metadata:
   - service category match
   - budget bounds
   - ZIP prefix coverage
3. Remaining providers are ranked with weighted score inputs (provider weight + SLA + intent boost).
4. Top-N providers are selected and stored in `routing_runs.response_payload.providerCandidates`.
5. `POST /api/v1/routing/dispatch` creates:
   - one `quote_requests` record
   - one-or-many `dispatches` records
   - handoffs for orchestration compatibility

## Reasoning + Outcomes
- Route reasoning is persisted in:
  - `routing_decisions.metadata`
  - `quote_requests.reasoning`
- Dispatch outcome state is persisted in:
  - `dispatches.status`, `attempt_count`, `last_error`
  - `quote_requests.outcomes`

## N8N Workflow
`n8n/workflows/provider-dispatch-routing.json` defines asynchronous provider dispatch with retry + exponential backoff semantics and event emission for completion/outcome audit trails.

## Endpoint Summary
- `GET /api/v1/providers/search`
- `POST /api/v1/routing/evaluate`
- `POST /api/v1/routing/dispatch`
- `GET /api/v1/quote-requests/{id}`
