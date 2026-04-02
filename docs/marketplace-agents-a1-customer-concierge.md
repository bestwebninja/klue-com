# A1 Customer Concierge (v1)

## Mission
Collect required customer profile details and convert incomplete requests into routable tasks.

## Required outputs
- Contact method, service category, location, and short need summary.
- Status transition from `queued` ➜ `in_progress` ➜ `completed`.

## Rules-first behavior
- If contact info missing, request profile completion template.
- If service category ambiguous, map to normalized taxonomy before handoff.
- Escalate to A8 only for complaint-style signals.

## AI/ML hook
- Intent extraction and autofill recommendations per channel.
