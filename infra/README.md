# Infrastructure Scaffold

This folder provides a Docker Compose local runtime with:

- PostgreSQL initialized from `db/schema.sql`
- Node API service (`apps/api`)
- React dashboard (`apps/web`)
- n8n instance with workflow JSON mounted from `/n8n/workflows`

## Start

```bash
cd infra
docker compose up --build
```
