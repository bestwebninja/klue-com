# Kluje Enterprise Platform Build Specification

**Document Owner:** Product & Engineering  
**Version:** 1.0  
**Status:** Draft for Implementation  
**Last Updated:** 2026-03-29

---

## 1) Executive Overview

Kluje is an enterprise service marketplace platform connecting demand-side users (customers seeking services) with vetted supply-side providers (service professionals and partner organizations). This specification defines a production-ready platform architecture and delivery plan designed for reliability, secure multi-tenant operations, extensibility, and monetization at scale.

The platform strategy combines:
- **Demand generation and monetization** through ad inventory and premium placements.
- **Recurring enterprise revenue** through SaaS subscriptions and operational tooling.
- **Transaction and conversion monetization** via lead routing, lead fees, and downstream partner integrations.

The technical design uses a modern web stack with:
- **Frontend:** React
- **Backend APIs:** Node.js
- **Core data layer:** PostgreSQL
- **Payments and subscriptions:** Stripe
- **Workflow orchestration and automation:** n8n

Design principles:
1. **Security-first by default** (least privilege, encryption, auditability).
2. **Composable architecture** (modular domains, contract-driven APIs).
3. **Operational resilience** (fault isolation, retries, observability).
4. **Scalable monetization model** (ads + SaaS + lead routing).
5. **Enterprise readiness** (SLA support, compliance pathways, tenant controls).

---

## 2) Revenue Model

### 2.1 Ads (Demand-Side Monetization)

**Products**
- Sponsored listing slots (SERP and category pages).
- Display inventory (banner/native placements on high-intent pages).
- Retargeting audiences (via compliant event exports).

**Commercial Models**
- CPC (cost per click) for listing promotion.
- CPM for display campaigns.
- Fixed sponsorship packages for enterprise partners.

**Core Requirements**
- Ad-serving eligibility based on tenant and compliance rules.
- Impression/click event tracking with anti-fraud signals.
- Reporting APIs for campaign performance.

### 2.2 SaaS (Platform Subscription)

**Plans**
- **Starter:** Basic lead intake + limited routing volume.
- **Growth:** Advanced workflow automation + analytics.
- **Enterprise:** SSO, advanced RBAC, SLAs, dedicated integrations.

**Billing Mechanics**
- Monthly/annual subscriptions.
- Tiered feature entitlements.
- Metered overages (e.g., additional routed leads, API requests).

### 2.3 Lead Routing (Performance Revenue)

**Monetization Patterns**
- Per-qualified-lead fees.
- Revenue-share agreements with preferred partners.
- Priority routing premiums (auction or fixed premium model).

**Qualification Inputs**
- Geo coverage, service taxonomy, SLA capability, historical conversion.
- Compliance prerequisites (licenses/certifications where applicable).

---

## 3) System Architecture

### 3.1 High-Level Stack

- **React Web Application**
  - Customer portal, provider portal, admin console.
- **Node.js API Layer**
  - REST/JSON APIs (optionally GraphQL read layer in phase 2).
  - Domain modules: Auth, Leads, Routing, Billing, Ads, Reporting.
- **PostgreSQL**
  - OLTP source of truth, transactional consistency.
  - Partitioning for high-volume events.
- **Stripe**
  - Subscription lifecycle, invoices, payment intents, webhooks.
- **n8n**
  - Asynchronous business workflows, partner fan-out, notifications.

### 3.2 Architectural Pattern

- **Modular monolith** in Node for initial velocity and operational simplicity.
- Domain boundaries enforced by internal service interfaces.
- Event-driven integration via outbox pattern for async flows.

### 3.3 Non-Functional Targets

- API p95 latency: `< 300 ms` for standard reads.
- Platform availability: `99.9%` baseline target.
- RPO: `<= 15 min`; RTO: `<= 60 min`.
- Horizontally scalable stateless API tier.

---

## 4) Service Map

### 4.1 User-Facing Services

1. **Identity Service**
   - User auth, org membership, RBAC, MFA policies.
2. **Lead Intake Service**
   - Inbound lead capture, normalization, enrichment hooks.
3. **Routing Service**
   - Deterministic + score-based provider selection.
4. **Provider Service**
   - Profiles, service areas, certifications, capacity windows.
5. **Billing Service**
   - Stripe customer/subscription mapping, invoice lifecycle.
6. **Ads Service**
   - Campaign creation, slot assignment, attribution events.
7. **Reporting Service**
   - Tenant dashboards, financial and operational metrics.

### 4.2 Platform Services

- **Notification Service:** Email/SMS/webhook delivery orchestration.
- **Audit Service:** Immutable audit trails for critical actions.
- **Feature Flag Service:** Controlled rollout and segmentation.
- **Compliance Service:** Data retention and export policy enforcement.

---

## 5) API Structure

### 5.1 API Standards

- RESTful endpoints under `/api/v1`.
- JSON request/response contracts with versioned schemas.
- Idempotency keys for all mutating operations involving payments and routing.
- OpenAPI 3.1 definition as source of truth.

### 5.2 Core Endpoint Groups

- `POST /api/v1/auth/login`
- `POST /api/v1/leads`
- `GET /api/v1/leads/{leadId}`
- `POST /api/v1/routing/evaluate`
- `POST /api/v1/routing/dispatch`
- `GET /api/v1/providers/search`
- `POST /api/v1/billing/subscriptions`
- `POST /api/v1/billing/webhooks/stripe`
- `POST /api/v1/ads/campaigns`
- `GET /api/v1/reports/tenant-summary`

### 5.3 API Security

- JWT access tokens with short TTL and refresh token rotation.
- Organization-scoped authorization checks on every tenant-bound request.
- Signed webhook verification for Stripe and partner callbacks.

---

## 6) Database Schema Plan (PostgreSQL)

### 6.1 Core Domain Tables

- `tenants` (org metadata, plan, status)
- `users` (identity profile)
- `memberships` (user ↔ tenant role map)
- `providers` (provider master record)
- `provider_capabilities` (service categories, geo coverage, capacity)
- `leads` (lead lifecycle state, qualification)
- `lead_events` (append-only event journal)
- `routing_decisions` (scoring output, selected targets)
- `dispatches` (downstream delivery status)
- `campaigns` / `ad_events` (ad monetization)
- `subscriptions` / `invoices` / `payments` (billing mirror data)
- `audit_logs` (immutable trace)

### 6.2 Data Design Principles

- UUID primary keys.
- `created_at`, `updated_at`, `deleted_at` soft-delete convention where appropriate.
- Partial indexes for active records and high-selectivity filters.
- Partitioning for high-write event tables (`lead_events`, `ad_events`) by month.

### 6.3 Integrity & Performance

- Foreign keys for all domain relationships.
- Unique constraints for business invariants (e.g., one active subscription per tenant-plan family).
- Materialized views or rollup tables for heavy dashboard queries.

---

## 7) Lead Routing Engine

### 7.1 Routing Lifecycle

1. **Intake:** Lead captured and normalized.
2. **Qualification:** Validation and enrichment.
3. **Candidate Selection:** Filter providers by hard constraints.
4. **Scoring:** Weighted score using performance and fit metrics.
5. **Dispatch:** Fan-out to top-N providers with throttling.
6. **Outcome Capture:** Accept/decline/conversion events recorded.

### 7.2 Scoring Inputs

- Service match quality.
- Geographic proximity and coverage confidence.
- Provider SLA adherence and response time.
- Historical conversion rate by segment.
- Pricing competitiveness (if supplied).
- Contractual priority tier.

### 7.3 Operational Controls

- Rule versioning with rollback.
- Dry-run simulation mode for model/rule updates.
- Circuit breaker to prevent misrouting during anomalies.

---

## 8) Stripe Billing

### 8.1 Core Stripe Objects

- Customer
- Product + Price (recurring + metered)
- Subscription
- Invoice
- PaymentIntent
- SetupIntent (for off-session charging readiness)

### 8.2 Billing Flows

- Trial-to-paid conversion.
- Mid-cycle plan upgrades/downgrades with proration.
- Metered billing finalization per cycle.
- Dunning and retry strategy for failed payments.

### 8.3 Webhook Handling

Required webhook events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Webhook processing requirements:
- Signature verification.
- Idempotent event consumption.
- Dead-letter strategy for poison events.

---

## 9) n8n Workflows

### 9.1 Workflow Domains

1. **Lead Intake Automation**
   - Validate payload, enrich with third-party signals, create lead.
2. **Partner Dispatch Workflow**
   - Route lead to partner endpoints with retries/backoff.
3. **Notification Workflow**
   - Trigger transactional email/SMS and internal alerts.
4. **Billing Ops Workflow**
   - Retry orchestration, CRM updates, finance notifications.
5. **Compliance Workflow**
   - Data retention timers, deletion/export jobs.

### 9.2 Workflow Standards

- Each workflow has owner, SLA, and runbook.
- Strict input/output contract with schema validation.
- Centralized secrets in secure vault integrations.
- Structured logs + correlation IDs.

---

## 10) Deployment

### 10.1 Environments

- **dev** (rapid iteration)
- **staging** (prod-like validation)
- **prod** (high availability)

### 10.2 Delivery Strategy

- Containerized services (Docker) with orchestrated deployments.
- CI/CD pipeline:
  1. Lint + unit tests
  2. Integration tests
  3. Security scans (dependencies, container images)
  4. DB migration checks
  5. Progressive deploy (canary/blue-green)

### 10.3 Operations

- Centralized logs (structured JSON), metrics, tracing.
- SLO-based alerting.
- Automated backups with restore drills.

---

## 11) Security Model

### 11.1 Identity & Access

- RBAC with tenant-scoped roles.
- SSO/SAML for enterprise plans.
- MFA enforcement for admin roles.

### 11.2 Data Protection

- TLS 1.2+ in transit.
- Encryption at rest (database and object storage).
- Field-level protection for sensitive PII.

### 11.3 Application Security

- OWASP-aligned controls.
- Rate limiting and abuse detection.
- CSRF/XSS/SQLi protections through framework + policy controls.
- Dependency and secret scanning in CI.

### 11.4 Governance & Audit

- Immutable audit logs for admin and financial actions.
- Data retention and deletion policies by tenant/legal profile.
- Periodic access reviews.

---

## 12) Roadmap

### Phase 0 (Weeks 0–4): Foundations

- Finalize domain model and API contracts.
- Implement auth, tenant model, baseline RBAC.
- Establish CI/CD and observability baseline.

### Phase 1 (Weeks 5–10): Core Marketplace

- Lead intake, provider management, routing v1.
- Initial dashboards and reporting basics.
- n8n lead + notification workflows.

### Phase 2 (Weeks 11–16): Monetization

- Stripe subscriptions + metered billing.
- Ads campaign management and attribution.
- Enhanced routing economics and premium tiers.

### Phase 3 (Weeks 17–24): Enterprise Hardening

- SSO/SAML, advanced audit features.
- Compliance automation and data governance tooling.
- Performance tuning and multi-region readiness plan.

---

## 13) Acceptance Criteria

### 13.1 Functional

- Tenants can onboard, configure provider networks, and submit leads.
- Routing engine selects valid providers and records transparent decision data.
- Stripe subscriptions and invoices sync reliably with internal billing records.
- n8n workflows process lead dispatch and notifications with retry safety.

### 13.2 Reliability

- Meets baseline SLOs in staging load tests.
- No critical-severity unhandled failure paths in lead routing and billing.

### 13.3 Security & Compliance

- All critical endpoints require authenticated and authorized access.
- Webhook endpoints verify signatures and enforce idempotency.
- Audit logging present for privileged and financial actions.

### 13.4 Operational Readiness

- Runbooks complete for lead-routing incidents, billing incidents, and workflow failures.
- Dashboards and alerts defined for API errors, queue lag, and payment failures.

---

## Appendix A: Suggested Initial KPIs

- Lead-to-dispatch success rate
- Provider response SLA adherence
- Conversion rate by category and partner
- MRR / ARR and churn by plan
- Failed payment recovery rate
- Ad CTR and ad-attributed revenue

## Appendix B: Implementation Notes

- Start with modular monolith; extract services only when scaling or isolation demands justify complexity.
- Keep API and workflow contracts versioned from day one.
- Treat observability and auditability as first-class acceptance criteria, not post-launch add-ons.
