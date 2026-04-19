# Architecture

## Folder Structure

- `supabase/migrations/`: relational schema migrations for walkthrough domain.
- `lib/supabase/`: Supabase client and centralized CRUD/query helpers.
- `lib/metrics/`: pure business calculations for completion, staffing, hours, cost, and risk.
- `components/`: UI primitives, domain components, and page composition for Walk Through dashboard.

## Data Flow

1. UI components trigger typed actions from the page container.
2. Container calls `lib/supabase/*` helpers for all persistence.
3. Returned records are passed to components as typed props.
4. Summary and planning outputs are generated via `lib/metrics/*` helpers.

## Continuation-Friendly Design

This structure is continuation-friendly for another AI system because each concern has one home:

- schema in SQL migrations,
- db logic in `lib/supabase/`,
- formulas in `lib/metrics/`,
- rendering in `components/`.

No duplicate architecture is introduced for these features, so future systems can extend one canonical path.

## Schema + DB Logic Boundaries

- Schema source of truth: `supabase/migrations/20260419090000_walkthrough_dashboard_schema.sql`
- CRUD/data access source of truth: `lib/supabase/`
- Metrics source of truth: `lib/metrics/`
- UI source of truth: `components/`
