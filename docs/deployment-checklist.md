# Deployment Checklist

## Environment
- [ ] Copy `.env.example` to `.env` and rotate all placeholder secrets.
- [ ] Set a strong `JWT_SECRET` (32+ chars), plus `JWT_ISSUER` and `JWT_AUDIENCE`.
- [ ] Confirm Stripe values (`STRIPE_SECRET_KEY`, webhook secret, product/price IDs).
- [ ] Verify `DATABASE_URL` for target environment.
- [ ] Configure `CORS_ORIGIN` to the production web domain.
- [ ] Set n8n credentials and `N8N_ENCRYPTION_KEY`.

## Security Controls
- [ ] Verify API auth flows issue/refresh JWTs correctly.
- [ ] Confirm rate limit settings (`RATE_LIMIT_*`, `AUTH_RATE_LIMIT_MAX`) match expected traffic.
- [ ] Keep `NODE_ENV=production` in deploy environment.
- [ ] Restrict database/network ingress to trusted services only.

## Runtime Validation
- [ ] `docker compose -f infra/docker-compose.yml up --build` succeeds.
- [ ] API health endpoint returns 200 at `/api/v1/health`.
- [ ] Protected routes reject requests missing bearer token.
- [ ] Web app can reach API using `VITE_API_BASE_URL`.

## Operations
- [ ] Enable logs/monitoring for API and n8n.
- [ ] Create DB backup and restore procedure.
- [ ] Confirm rollback plan and image tags before release.
