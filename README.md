# Kluje Enterprise Platform Monorepo

Production-ready scaffold aligned with `docs/enterprise-build-spec.md`.

## Project Structure

- `apps/web` — React + Vite operations dashboard shell
- `apps/api` — Node.js/Express API with `/api/v1` route groups
- `packages/shared` — Shared TypeScript domain contracts
- `infra` — Docker Compose stack + PostgreSQL bootstrap schema
- `n8n/workflows` — Workflow templates for onboarding, routing, billing, and campaign approvals

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose (for local infra stack)

## Quick Start

1. Install dependencies at repo root:

```bash
npm install
```

2. Copy environment values:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

3. Run services (recommended in separate terminals):

```bash
npm run dev:api
npm run dev:web
```

- Web: `http://localhost:5173`
- API: `http://localhost:4000/api/v1`

## Build & Typecheck

```bash
npm run build
npm run typecheck
```

## Run Infra Stack

```bash
cd infra
docker compose up --build
```

This brings up PostgreSQL, API, Web, and n8n with workflows mounted from `n8n/workflows`.

## Notes

- API contracts and route conventions are documented in `apps/api/openapi.yaml`.
- Database bootstrap schema is in `infra/db/schema.sql`.
- Additional architecture and rollout docs are under `docs/`.
- Stripe billing in `apps/api` now expects checkout price/product env placeholders:
  `STRIPE_PRICE_ID_STARTER`, `STRIPE_PRICE_ID_GROWTH`, `STRIPE_PRODUCT_ID_STARTER`,
  `STRIPE_PRODUCT_ID_GROWTH`, `STRIPE_CHECKOUT_SUCCESS_URL`, and
  `STRIPE_CHECKOUT_CANCEL_URL`.
