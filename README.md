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

## Local Setup (without Docker)

1. Install dependencies:

```bash
npm install
```

2. Start the Vite development server:

```bash
npm run dev
```

- Web: `http://localhost:5173`

## Command Reference

```bash
npm run dev          # start local web development server
npm run build        # production build
npm run build:dev    # development-mode build
npm run build:verify # alias for build verification
npm run typecheck    # TypeScript no-emit check
npm run lint         # ESLint on JS/CJS/MJS files
npm run preview      # preview built output
```

## Local Setup (Docker Compose)

```bash
cd infra
docker compose up --build
```

Services:
- Web: `http://localhost:5175`
- API: `http://localhost:4000/api/v1`
- Postgres: `localhost:5432`
- n8n: `http://localhost:5678`

## Security Baseline Included

- JWT access + refresh tokens on `/api/v1/auth/*`
- Bearer auth required for campaign, lead, and non-webhook billing endpoints
- Zod payload validation on route inputs
- Global and auth-specific rate limiting via `express-rate-limit`
- `helmet` and CORS origin controls for API headers

## Build & Typecheck

```bash
npm run build
npm run typecheck
```

## Deployment Checklist

See `docs/deployment-checklist.md` for pre-release checks covering env setup, security, runtime validation, and operations handoff.

## Notes

- API contracts and route conventions are documented in `apps/api/openapi.yaml`.
- Database bootstrap schema is in `infra/db/schema.sql`.
- Additional architecture and rollout docs are under `docs/`.
