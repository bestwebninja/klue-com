# A0 Router / Orchestrator (v1)

## Mission
Deterministically route marketplace work items across agents A1–A8 and enforce auditable transitions.

## Inputs
- Task payload from `/api/v1/marketplace-agents/tasks`.
- Task context including correlation id, tenant id, and optional `areaRiskBand` from `/api/v1/area-risk/score`.

## v1 deterministic rules
1. Missing customer profile fields ➜ A1.
2. Missing scoping fields (budget/timeline) ➜ A2.
3. High area risk or fraud/dispute indicators ➜ A7.
4. Quotes ready ➜ A4.
5. Else ➜ A3.

## Extension seam (AI later)
- Replace static rule table with policy engine + confidence calibration model.
- Add replay/simulation mode against historical tasks.
