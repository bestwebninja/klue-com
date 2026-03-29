# Kluje Monetization Platform Scaffold

This repository includes:
- API scaffold in Node.js + TypeScript + Express
- SQL migrations and seeds
- n8n production workflow JSON files
- Stripe live setup walkthrough

## Quick start
1. Copy `.env.example` to `.env`
2. Install dependencies:
   `npm install`
3. Run migrations manually against Postgres from `db/migrations`
4. Seed minimum data from `db/seeds/001_seed_minimum.sql`
5. Start API:
   `npm run dev`

## Useful paths
- API: `apps/api`
- n8n workflows: `apps/n8n/workflows`
- Docs: `docs`

## Notes
This is a ready-to-run scaffold, but some production handlers are placeholders by design:
- Stripe webhook persistence logic
- Ad engine query optimization
- metrics aggregation
- background queue jobs

Those are the next implementation steps for your engineering team.
