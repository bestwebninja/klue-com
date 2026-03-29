# Enterprise MVP Scaffold

This scaffold adds a modular enterprise foundation aligned to `enterprise-build-spec.md`:

- `apps/web`: React + Tailwind operations dashboard (campaigns, lead throughput, Stripe billing panel)
- `apps/api`: Node/Express API under `/api/v1` with auth, campaigns, leads, and Stripe billing endpoints
- `packages/shared`: shared domain types for role, campaign, lead, and plan contracts
- `infra`: Docker Compose local runtime and PostgreSQL schema bootstrap
- `n8n/workflows`: starter workflows for onboarding, lead routing, billing alerts, and campaign approval

## API highlights

- REST routes follow `/api/v1` convention
- Billing endpoints include Stripe checkout and verified webhook processing
- Tenant header middleware (`x-tenant-id`) added for tenant-scoped request context

## Database highlights

- PostgreSQL schema includes tenants, users/roles, advertisers, campaigns, leads, subscriptions, invoices, and events
- Includes unique webhook idempotency keys and analytics-focused indexes
