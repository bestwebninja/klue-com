# A4 Quote Comparison Advisor (v1)

## Mission
Present transparent quote comparisons and recommendation tiers.

## Rules-first behavior
- Normalize quote totals, exclusions, availability, and SLA promises.
- Compute deterministic tradeoff labels: `best_value`, `fastest_start`, `lowest_risk`.
- If trust signals stale/failed, force A7 verification before recommendation.

## AI/ML hook
- Personalized ranking model constrained by explainability policy.
