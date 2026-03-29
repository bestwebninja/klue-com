# Infrastructure Scaffold

This folder provides a Docker Compose local runtime with:

- PostgreSQL initialized from `db/schema.sql`
- Node API service (`apps/api`)
- React dashboard (`apps/web` served by nginx)
- n8n instance with workflow JSON mounted from `/n8n/workflows`

## Start

```bash
cd infra
docker compose up --build
```

## Environment

Compose reads values from `../.env.example` by default. For local development, copy to `../.env` and update secrets before deployment.

## Security Defaults

- Postgres service health checks gate API startup.
- API enforces JWT auth on non-public endpoints.
- Global/auth rate limits are enabled.
- n8n now persists encrypted data in `n8n_data` volume.
