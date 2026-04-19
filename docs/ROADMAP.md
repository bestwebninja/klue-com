# Roadmap

## Already Built

- Normalized walkthrough schema with floors, areas, tasks, task status, settings, and area metrics foundation.
- Centralized Supabase CRUD layer for walkthrough workflows.
- Componentized UI for editing floors/areas/tasks and viewing QA summaries.
- Dedicated metrics engine for completion, staffing, hours, cost, and basic risk score.
- Documentation and environment setup guidance.

## Next Work

1. Add authenticated walkthrough ownership + RLS policies for production isolation.
2. Add server-side aggregate sync for `walkthrough_area_metrics` (trigger/function or edge function).
3. Connect `WalkThroughPage` into router/navigation for production entrypoint.
4. Add optimistic UI states and toast feedback for add/edit/remove actions.
5. Add integration tests for CRUD helpers and metrics correctness.

## Future AI / Risk Direction

- Introduce a dedicated AI/risk tab that surfaces:
  - anomaly detection across area completion,
  - risk trend lines by floor,
  - remediation suggestions tied to scope/priority changes,
  - confidence-scored recommendations.

## Intentionally Deferred

- Dedicated AI risk page is deferred until baseline dashboard usage data is available.
- Advanced forecasting (multi-shift staffing simulation) is deferred to a later milestone.
