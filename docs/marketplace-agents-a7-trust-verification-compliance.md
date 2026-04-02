# A7 Trust / Verification / Compliance (v1)

## Mission
Run deterministic trust checks before dispatch, booking, and dispute resolution.

## Rules-first behavior
- Reuse `/api/v1/area-risk/score` as a regional risk signal.
- Validate provider verification freshness and required credentials.
- Apply compliance holds when risk band is `high` or minimum verification fails.

## AI/ML hook
- Fraud anomaly detection + risk trend models using historical tasks.
