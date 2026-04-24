# Walk Through Operations Dashboard

A React + TypeScript + Tailwind + Supabase dashboard for janitorial/operations walkthrough planning. Teams can manage floors, areas, and tasks with inline edits, then review QA completion and labor/cost summaries.

## Stack

- React + TypeScript
- Tailwind CSS
- shadcn/ui-compatible styling patterns
- Supabase Postgres + Supabase JS client

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add environment variables in `.env` (see `.env.example`).
3. Run development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Supabase Configuration

- SQL schema and constraints live in `supabase/migrations/`.
- Apply migrations with your normal Supabase migration workflow (`supabase db push` or CI migration pipeline).

## Code Organization

- DB access (CRUD and table mutations): `lib/supabase/`
- Metrics/business calculations: `lib/metrics/`
- UI components and page composition: `components/`
- Schema migration source: `supabase/migrations/`
- Additional docs: `docs/`

## CRUD Coverage

The data layer centralizes:

- Walkthrough creation/fetch
- Floor add/edit/remove
- Area add/edit/remove
- Task add/edit/remove
- Area-task status toggles
- Walkthrough settings load/update

## Metrics Coverage

The metrics layer centralizes:

- Task completion totals and ratios
- Scope/priority multiplier lookup
- Staffing requirement calculations
- Hours and cost calculations
- Initial risk scoring helper

## AI Build Instructions

Before extending this repository with Lovable or another coding agent, read:
- `/docs/LOVABLE_INSTRUCTIONS.md`

This repo is continuation-first:
- extend the existing architecture
- do not regenerate the app from scratch
- do not create duplicate systems or alternate file patterns

Required structure:
- UI lives in `components/`
- Database logic lives in `lib/supabase/`
- Metrics and calculations live in `lib/metrics/`
- SQL schema lives in `supabase/migrations/`

<!-- Lovable sync nudge: PR #169 / commit 3c04d999040fc9bf8a0466a1e1fbec25d7410f6a -->
