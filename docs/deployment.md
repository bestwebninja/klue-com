# Kluje Enterprise Deployment and Operations Specification

**Document Owner:** SRE + Platform Engineering  
**Version:** 1.0  
**Status:** Implementation Blueprint  
**Last Updated:** 2026-03-29  
**Aligned Spec:** `/docs/enterprise-build-spec.md`

---

## 1) Purpose and Scope

This document defines how Kluje services are built, deployed, operated, and recovered across development, staging, and production environments. It provides deployment standards aligned to enterprise availability, security, and resilience goals.

### In Scope
- Environment topology and promotion model
- CI/CD quality gates
- Container and runtime standards
- Database migration release process
- Observability, alerting, and incident operations
- Backup, restore, and disaster recovery controls

### Out of Scope
- Product feature behavior
- Detailed workflow logic (covered in `/docs/n8n-workflows.md`)

---

## 2) Environment Strategy

Three persistent environments are required:

1. **dev**
   - Fast iteration, developer integration testing.
   - Lower SLO guarantees.
2. **staging**
   - Production-like validation, load/perf/security checks.
   - Mandatory release gate before production.
3. **prod**
   - Customer-serving high-availability environment.
   - Strict change control and rollback readiness.

### Environment Parity Requirements
- Same core runtime versions (Node, PostgreSQL major version, n8n version) across staging/prod.
- Equivalent infrastructure patterns (networking, autoscaling, secrets management).
- Production data never replicated to dev without anonymization controls.

---

## 3) Deployment Architecture

## 3.1 Runtime Components

- **Web App (React):** static assets via CDN + edge cache.
- **API Service (Node.js modular monolith):** stateless container replicas.
- **PostgreSQL:** managed HA cluster with backups.
- **n8n:** worker + webhook runtime with persistent execution storage.
- **Supporting services:** queue/broker (if adopted), centralized log + metrics + trace backend.

## 3.2 Container Standards

- Minimal base images (distroless/alpine where practical)
- Non-root user execution
- Read-only filesystem when possible
- Explicit CPU/memory requests and limits
- Health probes:
  - liveness
  - readiness
  - startup probes for cold start heavy services

---

## 4) CI/CD Pipeline

Pipeline stages (must pass in order):

1. **Static checks**
   - Linting
   - Type checking
   - Unit tests
2. **Integration checks**
   - API integration tests
   - DB migration dry-run and rollback simulation in ephemeral DB
3. **Security checks**
   - Dependency vulnerability scan
   - Secret scan
   - Container image scan
4. **Contract checks**
   - OpenAPI validation
   - Breaking-change detection for public API contracts
5. **Artifact and release**
   - Build signed immutable artifacts/images
   - Generate SBOM and provenance metadata
6. **Progressive deployment**
   - Staging deploy + smoke tests
   - Canary or blue/green in production

### Release Promotion Rules
- `main` branch merges produce versioned release candidates.
- Production deployment requires:
  - successful staging verification
  - no unresolved critical/high vulnerabilities
  - migration plan and rollback strategy documented

---

## 5) Database Migration Process

Migration process for each release:

1. Generate forward-only migration script.
2. Validate on fresh schema and near-prod dataset clone in staging.
3. Ensure zero-downtime compatibility (expand/contract approach).
4. Run migration as explicit pipeline step with lock timeout policy.
5. Verify post-migration checks (index readiness, row counts, invariants).

### Guardrails
- Block destructive migrations in same release as incompatible app changes.
- Require concurrent index operations for large tables.
- Pre-create monthly partitions for event tables.

---

## 6) Configuration and Secret Management

- Twelve-factor style environment config.
- No secrets in source control.
- Centralized secret manager for:
  - database credentials
  - Stripe keys/webhook secrets
  - partner HMAC keys
  - JWT signing keys
- Secret rotation schedule and break-glass procedure documented.

---

## 7) Security in Deployment

- TLS termination with modern cipher suite policy.
- Network segmentation:
  - public ingress only for web/API/webhooks
  - private networking for DB/internal services
- Principle of least privilege for IAM/service accounts.
- CI-enforced dependency and image scanning.
- Audit logging for deploy actions and production access.

---

## 8) Reliability, Scaling, and Performance

## 8.1 Availability and SLO Alignment

Target baseline:
- Platform availability: **99.9%**
- API standard read p95 latency: **<300ms**
- Recovery targets:
  - **RPO ≤ 15 minutes**
  - **RTO ≤ 60 minutes**

## 8.2 Scaling Policies

- Horizontal autoscaling for API based on CPU + latency + queue depth.
- n8n worker autoscaling based on workflow backlog and execution time.
- Scheduled scaling for known traffic windows.

## 8.3 Resilience Controls

- Circuit breakers for partner calls.
- Retry with exponential backoff and jitter.
- Dead-letter handling for poison events.
- Graceful degradation modes (e.g., temporary fallback routing behavior).

---

## 9) Observability and Incident Operations

## 9.1 Required Telemetry

- **Logs:** structured JSON with correlation IDs.
- **Metrics:** RED/USE metrics, queue lag, webhook failures, payment failures.
- **Tracing:** distributed traces across API, DB calls, and n8n workflows.

## 9.2 Alerting

SLO-driven alert classes:
- Availability degradation
- Elevated API error rates
- Routing dispatch failure spikes
- Billing webhook processing backlog
- Database replication lag / storage saturation

## 9.3 Runbooks

Mandatory runbooks:
- Lead routing incident
- Billing incident (Stripe webhook or dunning failures)
- Workflow engine degradation
- Database failover/recovery

---

## 10) Backup, Restore, and Disaster Recovery

## 10.1 Backup Policy

- Automated full + incremental backups for PostgreSQL.
- Point-in-time recovery enabled.
- Backup encryption and cross-zone (or cross-region) durability.

## 10.2 Restore Validation

- Scheduled restore drills (at least quarterly).
- Restore verification checklist:
  - schema integrity
  - critical table row counts
  - application smoke tests

## 10.3 DR Procedures

- Regional outage response playbook.
- Controlled failover process with communication templates.
- Post-incident review with remediation tracking.

---

## 11) Deployment Strategies by Component

### API Service
- Prefer rolling + canary with automated rollback on error budget burn.

### Web App
- Atomic static asset deploys with CDN cache versioning.

### n8n Workflows
- Workflow version pinning and controlled activation.
- Replay/backfill plan for failed executions.

### Database
- Migrations decoupled but release-linked.
- Backward-compatible schema during rollout window.

---

## 12) Operational Readiness Checklist

Before production go-live:
- [ ] CI/CD pipeline has all required quality and security gates
- [ ] Staging parity verified against production architecture
- [ ] Observability dashboards and alert routing configured
- [ ] Runbooks reviewed and on-call team trained
- [ ] Backup + restore drill completed and documented
- [ ] Security controls validated (secrets, IAM, network, TLS)
- [ ] Rollback and incident communication procedures validated

