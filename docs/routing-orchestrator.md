# Routing Orchestrator Backbone

## Purpose

The routing orchestrator provides a transparent, deterministic backbone for marketplace handoff decisions in the API modular monolith. It aligns to the enterprise build spec by separating:

1. Evaluation (intent + user typing + deterministic rule selection)
2. Dispatch (handoff creation/fan-out)
3. Traceability (run-level decision metadata + correlation IDs + rule versions)

## Evaluation Flow (`POST /api/v1/routing/evaluate`)

1. **Input validation (zod):** Requires tenant context, lead summary, service category, and requester metadata.
2. **Intent classification stub:** A keyword-based classifier labels requests as `urgent_service`, `planned_project`, or `quote_only`.
3. **User type detection stub:** A heuristic detector marks users as `homeowner`, `property_manager`, `enterprise_partner`, or `unknown`.
4. **Deterministic rule evaluation:**
   - Chooses rule + rule version (`rule-default-routing-v1` fallback)
   - Produces provider queue and dispatch mode (`single` or `fanout`)
5. **Persistence:** Stores a `routing_runs` record and append-only `routing_decisions` records, including:
   - `correlation_id`
   - `rule_version_id`
   - transparent metadata (signals, reasoning, queue)

## Dispatch Flow (`POST /api/v1/routing/dispatch`)

1. Load evaluated run by `runId`.
2. Build handoff plan from evaluated queue:
   - `single` dispatch: first target
   - `fanout` dispatch: top 3 targets
3. Persist handoff records to `handoffs` table.
4. Update run status to `dispatched` and attach dispatch summary metadata.
5. Return run/handoff summary with correlation ID (generated if request header missing).

## Run Retrieval (`GET /api/v1/routing/runs/{runId}`)

Returns a single run envelope containing:

- `run`: top-level state, payloads, rule version, decision metadata
- `decisions`: deterministic candidate-selection decisions
- `handoffs`: generated dispatch handoffs and status

This endpoint is designed for supportability, auditability, and future incident replay tooling.

## Versioning and Rollback Strategy

The database model introduces explicit rule versioning entities:

- `routing_rules` for logical rule identity
- `routing_rule_versions` for immutable version snapshots + status lifecycle (`draft`, `active`, `archived`, `rolled_back`)

Recommended operational pattern:

1. Create a new `routing_rule_versions` row in `draft`.
2. Run dry-run evaluations (`dryRun: true`) and compare outcomes.
3. Promote to `active` (set `activated_at`).
4. For regressions, mark active version `rolled_back` and reactivate prior known-good version.

Because every run stores `rule_version_id` and `correlation_id`, post-rollback analysis can be filtered to affected runs and replayed deterministically.
