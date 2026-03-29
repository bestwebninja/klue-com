# Kluje Enterprise Platform Specification

## 1. Executive Overview

Kluje is an enterprise-grade marketplace and growth platform that connects service seekers with vetted providers while enabling advertisers and partners to monetize demand generation at scale. This specification defines a production-ready architecture, domain model, and operating blueprint for a multi-tenant platform that supports:

- High-volume lead intake and intelligent routing
- Self-serve and managed advertising products
- Subscription and usage-based billing
- Real-time campaign and placement analytics
- Workflow automation across onboarding, approvals, and billing operations

The platform is designed around modular services, API-first contracts, strong tenant isolation, and automation-first operations.

Primary business outcomes:

- Increase qualified lead conversion through smart matching and routing
- Grow recurring revenue through SaaS subscriptions and premium tools
- Expand ad inventory monetization with transparent campaign controls
- Reduce operational overhead through event-driven workflows (n8n)

---

## 2. Revenue Model

Kluje uses a hybrid revenue model with three core streams.

### 2.1 Advertising Revenue

**Products**
- Sponsored listings
- Priority placement slots
- Display/native campaign inventory
- Geo-targeted campaign boosts

**Pricing approaches**
- CPC (cost per click)
- CPL (cost per lead)
- CPM (cost per 1,000 impressions) for premium display units

**Optimization levers**
- Bid multipliers by geography/category
- Quality score influence on placement ranking
- Daily and lifetime campaign budget caps

### 2.2 SaaS Subscription Revenue

**Buyer personas**
- Small service providers
- Multi-location operators
- Enterprise advertiser accounts

**Plan model**
- Free tier: limited visibility and lead access
- Pro tier: advanced lead insights, CRM integrations, analytics exports
- Enterprise tier: SSO, custom SLAs, account management, API limits uplift

**Billing cadence**
- Monthly and annual subscriptions
- Optional add-ons (extra seats, advanced analytics, premium support)

### 2.3 Lead Routing & Referral Revenue

**Mechanisms**
- Per-qualified-lead fees
- Revenue share with partner networks
- Dynamic pricing by category, location, and lead intent score

**Controls**
- Lead quality thresholds (contact validity, intent confidence)
- Fraud checks and duplicate suppression
- Refund/credit policy tied to lead disposition rules

---

## 3. System Architecture

### 3.1 Technology Stack

- **Frontend:** React (TypeScript), component-driven UI, role-aware dashboards
- **Backend:** Node.js (TypeScript) with modular service boundaries
- **Database:** PostgreSQL (primary OLTP), schema-based tenancy or tenant-key isolation
- **Billing:** Stripe (subscriptions, invoices, payment intents, webhooks)
- **Automation:** n8n (workflow orchestration and event processing)

### 3.2 High-Level Architecture

1. React SPA communicates with Node API Gateway/BFF via HTTPS.
2. Backend services expose REST endpoints under `/api/v1`.
3. Core services persist transactional data in PostgreSQL.
4. Domain events (campaign status, lead created, invoice failed) are emitted to an internal event bus/queue.
5. n8n consumes events to execute async workflows and operational automations.
6. Stripe handles payments and invoices, with webhook callbacks updating billing state.

### 3.3 Non-Functional Targets

- **Availability:** 99.9% SLA baseline
- **Scalability:** horizontal API scaling and stateless services
- **Performance:** p95 API latency < 300ms for read endpoints
- **Auditability:** immutable event/audit logs for sensitive actions
- **Compliance readiness:** SOC2-oriented controls and data governance foundations

---

## 4. Service Map

### 4.1 Auth Service

Responsibilities:
- User registration/login
- JWT issuance/refresh
- Password reset and MFA hooks
- RBAC policy evaluation support

### 4.2 Advertiser Service

Responsibilities:
- Advertiser account lifecycle
- Business profile and verification status
- Team member management and role assignment

### 4.3 Campaign Service

Responsibilities:
- Campaign CRUD
- Budgeting, targeting, and pacing rules
- Creative assets and moderation states

### 4.4 Placement Service

Responsibilities:
- Inventory definitions (search, listing pages, category pages)
- Placement eligibility and ranking inputs
- Serving metadata and tracking hooks

### 4.5 Billing Service

Responsibilities:
- Subscription state synchronization
- Invoice and payment status projection
- Entitlement calculation by plan/add-ons

### 4.6 Analytics Service

Responsibilities:
- Impression/click/lead event ingestion
- Aggregation and reporting APIs
- Conversion funnel and cohort metrics

---

## 5. API Structure (`/api/v1`)

### 5.1 Conventions

- Base path: `/api/v1`
- JSON request/response payloads
- JWT Bearer authentication for protected routes
- Idempotency keys required for billing and lead ingestion writes
- Pagination: cursor-based (`nextCursor`) for high-scale resources

### 5.2 Representative Endpoint Map

#### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/password/forgot`
- `POST /api/v1/auth/password/reset`

#### Users & Roles
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/users/:id`
- `GET /api/v1/roles`
- `POST /api/v1/users/:id/roles`

#### Advertisers
- `POST /api/v1/advertisers`
- `GET /api/v1/advertisers/:id`
- `PATCH /api/v1/advertisers/:id`
- `POST /api/v1/advertisers/:id/verify`

#### Campaigns
- `POST /api/v1/campaigns`
- `GET /api/v1/campaigns`
- `GET /api/v1/campaigns/:id`
- `PATCH /api/v1/campaigns/:id`
- `POST /api/v1/campaigns/:id/activate`
- `POST /api/v1/campaigns/:id/pause`

#### Placements
- `GET /api/v1/placements`
- `POST /api/v1/placements`
- `PATCH /api/v1/placements/:id`

#### Leads
- `POST /api/v1/leads`
- `GET /api/v1/leads`
- `GET /api/v1/leads/:id`
- `POST /api/v1/leads/:id/route`
- `POST /api/v1/leads/:id/disposition`

#### Billing
- `POST /api/v1/billing/customers`
- `POST /api/v1/billing/checkout-session`
- `GET /api/v1/billing/subscriptions/:id`
- `POST /api/v1/billing/webhooks/stripe`
- `GET /api/v1/billing/invoices`

#### Analytics
- `GET /api/v1/analytics/overview`
- `GET /api/v1/analytics/campaigns/:id`
- `GET /api/v1/analytics/funnel`

---

## 6. Database Schema Design (PostgreSQL)

### 6.1 Core Tables

#### `tenants`
- `id` (uuid, pk)
- `name`
- `slug` (unique)
- `status` (active, suspended)
- `created_at`, `updated_at`

#### `users`
- `id` (uuid, pk)
- `tenant_id` (fk -> tenants.id)
- `email` (unique per tenant)
- `password_hash`
- `first_name`, `last_name`
- `status`
- `last_login_at`
- `created_at`, `updated_at`

#### `roles`
- `id` (uuid, pk)
- `tenant_id` (nullable for global roles)
- `name` (admin, advertiser_manager, analyst, billing_admin)
- `created_at`

#### `user_roles`
- `user_id` (fk -> users.id)
- `role_id` (fk -> roles.id)
- composite pk (`user_id`, `role_id`)

#### `advertisers`
- `id` (uuid, pk)
- `tenant_id` (fk)
- `legal_name`
- `display_name`
- `verification_status`
- `industry`, `website_url`
- `created_at`, `updated_at`

#### `campaigns`
- `id` (uuid, pk)
- `tenant_id` (fk)
- `advertiser_id` (fk)
- `name`
- `objective`
- `status` (draft, pending_approval, active, paused, completed)
- `daily_budget`, `lifetime_budget`
- `start_date`, `end_date`
- `created_by`
- `created_at`, `updated_at`

#### `campaign_targeting`
- `id` (uuid, pk)
- `campaign_id` (fk)
- `geo_json`
- `categories` (text[])
- `keywords` (text[])
- `device_filters` (jsonb)

#### `placements`
- `id` (uuid, pk)
- `tenant_id` (fk)
- `name`
- `surface` (search, listing, profile)
- `constraints` (jsonb)
- `active`

#### `leads`
- `id` (uuid, pk)
- `tenant_id` (fk)
- `campaign_id` (nullable fk)
- `source`
- `contact_name`, `contact_email`, `contact_phone`
- `location`
- `service_category`
- `intent_score` (numeric)
- `quality_score` (numeric)
- `status` (new, routed, accepted, rejected, refunded)
- `created_at`, `updated_at`

#### `lead_routes`
- `id` (uuid, pk)
- `lead_id` (fk)
- `advertiser_id` (fk)
- `route_reason`
- `rank_score`
- `delivered_at`
- `response_status`

#### `subscriptions`
- `id` (uuid, pk)
- `tenant_id` (fk)
- `advertiser_id` (nullable fk)
- `stripe_customer_id`
- `stripe_subscription_id`
- `plan_code`
- `status`
- `current_period_start`, `current_period_end`
- `cancel_at_period_end`

#### `invoices`
- `id` (uuid, pk)
- `subscription_id` (fk)
- `stripe_invoice_id`
- `amount_due`, `amount_paid`, `currency`
- `status`
- `hosted_invoice_url`
- `issued_at`, `paid_at`

#### `events`
- `id` (uuid, pk)
- `tenant_id` (fk)
- `event_type`
- `payload` (jsonb)
- `created_at`

### 6.2 Indexing & Data Rules

- Partial indexes for active campaigns and unresolved leads
- Compound indexes for (`tenant_id`, `created_at`) on event and analytics-heavy tables
- Unique constraints on Stripe IDs to enforce idempotent webhook processing
- Row-level security strategy for tenant scoped queries

---

## 7. Lead Routing Engine Design

### 7.1 Routing Goals

- Maximize lead-to-conversion probability
- Enforce fairness and delivery caps
- Honor advertiser eligibility constraints
- Minimize routing latency for near-real-time dispatch

### 7.2 Routing Pipeline

1. **Lead Intake & Validation**
   - Normalize contact/location fields
   - Validate required fields and anti-spam heuristics
2. **Eligibility Filter**
   - Match campaign targeting criteria
   - Exclude paused/budget-capped campaigns
3. **Scoring**
   - Composite score = bid weight + quality fit + response SLA performance + historical conversion score
4. **Policy Layer**
   - Enforce per-advertiser pacing, duplicate suppression, and max leads/day
5. **Dispatch**
   - Route to top N eligible advertisers
   - Persist lead route decisions and rationale
6. **Feedback Loop**
   - Ingest acceptance/rejection outcomes to continuously recalibrate scores

### 7.3 Reliability Considerations

- Idempotent route assignment key (`lead_id + advertiser_id`)
- Retry queue with exponential backoff for downstream delivery failures
- Dead-letter queue for manual ops triage

---

## 8. Stripe Billing Integration

### 8.1 Core Stripe Objects

- Customer: mapped to advertiser or tenant billing entity
- Subscription: plan and add-on entitlements
- Invoice: billing cycle statement
- PaymentIntent/Charge: payment execution details

### 8.2 Integration Flows

1. **Subscription Checkout**
   - Backend creates Stripe Checkout Session
   - Frontend redirects to Stripe-hosted page
   - Success callback confirms subscription state
2. **Webhook Processing**
   - Endpoint: `POST /api/v1/billing/webhooks/stripe`
   - Verify Stripe signature header
   - Process events (`invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`)
   - Upsert local subscription/invoice projections
3. **Dunning & Recovery**
   - Failed payment triggers n8n notifications and account grace-period logic
   - Optional auto-downgrade after grace expiration

### 8.3 Entitlement Enforcement

- Middleware resolves active plan and feature flags per request
- Hard limits: seat count, active campaigns, analytics retention period
- Soft limits: warning banners and upgrade prompts before blocking

---

## 9. n8n Workflow Design

### 9.1 Onboarding Workflow

Trigger:
- New advertiser created or invited user accepts invite

Steps:
1. Validate profile completeness
2. Create default campaign templates
3. Send onboarding email sequence
4. Notify CSM/ops channel for enterprise tier accounts

### 9.2 Lead Routing Workflow

Trigger:
- `lead.created` event

Steps:
1. Fetch eligible campaigns and budgets
2. Call routing engine endpoint
3. Deliver route notifications/webhooks to advertiser systems
4. Log delivery outcomes and retries

### 9.3 Billing Alerts Workflow

Trigger:
- Stripe webhook projection event (`payment_failed`, `invoice_overdue`)

Steps:
1. Send customer email notification
2. Create internal alert ticket/task
3. Escalate after configurable SLA window

### 9.4 Campaign Approval Workflow

Trigger:
- Campaign status changed to `pending_approval`

Steps:
1. Run policy checks (restricted category terms, missing assets)
2. Route to human reviewer queue when required
3. Auto-approve low-risk campaigns
4. Notify advertiser of approval/rejection reasons

---

## 10. Deployment Architecture

### 10.1 Containerization

- Docker images per service (frontend, API, worker, n8n)
- Multi-stage builds for reduced image size
- Immutable release tags and environment-specific config injection

### 10.2 Runtime Environments

**Option A: VPS-based deployment**
- Reverse proxy (Nginx/Caddy)
- Docker Compose for service orchestration
- Managed PostgreSQL preferred or hardened self-hosted cluster

**Option B: Cloud deployment (recommended)**
- Container orchestration (ECS/Kubernetes)
- Managed PostgreSQL (RDS/Cloud SQL)
- Managed secrets, load balancers, autoscaling

### 10.3 CI/CD & Operations

- CI pipeline: lint, unit tests, integration smoke tests, security scans
- CD pipeline: blue/green or rolling deploy with health checks
- Observability: centralized logs, metrics, tracing, alerting dashboards
- Backup/DR: automated snapshots, point-in-time recovery, tested restore playbooks

---

## 11. Security Model

### 11.1 Authentication & Token Strategy

- JWT access tokens with short TTL
- Refresh token rotation with revoke-on-compromise capability
- Optional MFA for privileged roles

### 11.2 Authorization (RBAC)

- Role-based access controls at API and UI layers
- Fine-grained permissions for billing, campaign approval, and lead exports
- Principle of least privilege by default role templates

### 11.3 Multi-Tenant Isolation

- Tenant-scoped data access via middleware + DB constraints
- Optional PostgreSQL Row-Level Security (RLS)
- Strict tenant context propagation in logs and events

### 11.4 Platform Hardening

- TLS 1.2+ end-to-end
- Secrets stored in dedicated secret manager
- Audit logs for auth events, billing changes, and permission updates
- WAF and rate limiting on public endpoints
- Secure SDLC with dependency and container vulnerability scanning

---

## 12. Roadmap Phases

### Phase 1: Foundation (Weeks 1–6)

- Core auth, tenant model, advertiser profiles
- Campaign CRUD and basic placements
- Stripe subscription checkout + webhook ingest
- Initial React admin dashboards

### Phase 2: Monetization & Routing (Weeks 7–12)

- Lead intake APIs and routing engine v1
- Campaign pacing and budget enforcement
- n8n workflows for onboarding and routing
- Baseline analytics dashboards

### Phase 3: Enterprise Controls (Weeks 13–18)

- Advanced RBAC, SSO groundwork, audit trails
- Billing dunning automations and plan entitlements
- Campaign approval workflow with human-in-loop
- Data exports and API usage governance

### Phase 4: Optimization & Scale (Weeks 19–24)

- Conversion feedback loops and score model tuning
- Performance optimization and query/index improvements
- Multi-region readiness planning
- Reliability hardening and cost optimization

---

## 13. Acceptance Criteria

The platform is considered production-ready when all criteria below are met.

### 13.1 Functional

- Users can register, authenticate, and access role-appropriate dashboards
- Advertisers can create/manage campaigns and budgets
- Leads are ingested, validated, routed, and dispositioned end-to-end
- Stripe subscriptions and invoices synchronize correctly from webhook events
- n8n workflows execute successfully for onboarding, routing, billing alerts, and approvals

### 13.2 Non-Functional

- p95 API response time within target for primary read endpoints
- Zero critical security findings in release security scan
- Recovery drill demonstrates restore to defined RPO/RTO objectives
- Monitoring and alerting coverage includes all critical services

### 13.3 Operational

- Runbooks published for incident response and billing failures
- Audit logs retained per policy and searchable by tenant and actor
- Deployment process supports rollback with documented procedure
- Stakeholder sign-off from Product, Engineering, Security, and Operations

---

## 14. Summary

This specification defines a scalable, secure, and monetization-ready enterprise architecture for Kluje. It combines modular service design, robust data modeling, deterministic lead routing, Stripe-powered billing, and n8n-driven automation to support both rapid delivery and long-term platform evolution.
