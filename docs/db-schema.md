# Kluje Enterprise Database Schema Specification

**Document Owner:** Data Platform Engineering  
**Version:** 1.0  
**Status:** Implementation Blueprint  
**Last Updated:** 2026-03-29  
**Database Engine:** PostgreSQL 15+  
**Aligned Spec:** `/docs/enterprise-build-spec.md`

---

## 1) Purpose and Scope

This document defines logical and physical schema conventions for the Kluje enterprise platform. It operationalizes tenant-safe data modeling, routing and billing integrity, event scalability, and auditability.

### In Scope
- Domain entities and relational structure
- Key constraints and lifecycle/state modeling
- Partitioning and indexing strategy
- Multi-tenant isolation patterns
- Data retention and compliance support

### Out of Scope
- Analytics warehouse/star schema (future data platform phase)
- Vendor-specific infrastructure tuning beyond PostgreSQL

---

## 2) Global Data Modeling Standards

1. **Primary keys:** UUID v7 (preferred) or UUID v4 fallback.
2. **Timestamps:** `created_at`, `updated_at` (UTC, `timestamptz`) on all mutable tables.
3. **Soft delete:** `deleted_at` on user-facing mutable entities where recovery is needed.
4. **Tenant scoping:** `tenant_id` on all tenant-bound records.
5. **Enums:** Prefer lookup tables or constrained text + check constraints for evolvability.
6. **PII handling:** Sensitive columns tagged and encrypted/tokenized where required.
7. **Auditability:** Critical state transitions captured via append-only event tables.

---

## 3) Schema Namespaces

Recommended namespaces:
- `core` – tenant, identity, provider, lead, routing, ads, billing core tables
- `audit` – immutable audit/event trails
- `ops` – outbox, idempotency keys, job control metadata
- `ref` – reference data (service taxonomy, country/state codes, plan metadata)

---

## 4) Core Entity Model

## 4.1 Tenancy and Identity

### `core.tenants`
Purpose: Organization-level configuration and plan metadata.

Columns (minimum):
- `id` UUID PK
- `name` text not null
- `slug` text unique not null
- `status` text not null (`active`, `suspended`, `trial`, `churned`)
- `plan_tier` text not null (`starter`, `growth`, `enterprise`)
- `billing_customer_id` text nullable (Stripe customer)
- `settings_json` jsonb not null default `{}`
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- unique (`slug`) where `deleted_at is null`
- btree (`status`)
- btree (`plan_tier`)

### `core.users`
Purpose: Identity profile.

Columns:
- `id` UUID PK
- `email` citext unique not null
- `password_hash` text nullable (for SSO-only, may be null)
- `mfa_enabled` boolean not null default false
- `status` text not null (`active`, `invited`, `disabled`)
- `last_login_at` timestamptz nullable
- `created_at`, `updated_at`, `deleted_at`

### `core.memberships`
Purpose: User ↔ tenant role mapping.

Columns:
- `id` UUID PK
- `tenant_id` UUID FK -> `core.tenants(id)`
- `user_id` UUID FK -> `core.users(id)`
- `role` text not null
- `status` text not null (`active`, `invited`, `revoked`)
- `created_at`, `updated_at`

Constraints:
- unique (`tenant_id`, `user_id`) where `status != 'revoked'`

---

## 4.2 Providers and Capabilities

### `core.providers`
Purpose: Provider master profile.

Columns:
- `id` UUID PK
- `tenant_id` UUID FK
- `external_partner_id` text nullable
- `name` text not null
- `provider_type` text not null (`individual`, `organization`, `partner_network`)
- `status` text not null (`active`, `paused`, `inactive`, `blocked`)
- `sla_tier` text nullable
- `rating` numeric(3,2) nullable
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- (`tenant_id`, `status`)
- (`tenant_id`, `provider_type`)

### `core.provider_capabilities`
Purpose: Service, geography, and capacity envelope.

Columns:
- `id` UUID PK
- `provider_id` UUID FK -> `core.providers(id)`
- `service_category_id` UUID FK -> `ref.service_categories(id)`
- `geo_coverage` jsonb not null
- `capacity_window` jsonb nullable
- `certifications_json` jsonb not null default `[]`
- `compliance_status` text not null (`valid`, `expired`, `pending`)
- `effective_from`, `effective_to` timestamptz
- `created_at`, `updated_at`

Constraints:
- exclusion or check to avoid overlapping active windows for identical provider/category if required

---

## 4.3 Leads and Lifecycle Events

### `core.leads`
Purpose: Canonical lead record with lifecycle state.

Columns:
- `id` UUID PK
- `tenant_id` UUID FK
- `source` text not null (`web`, `api`, `partner`, `import`)
- `service_category_id` UUID FK
- `request_payload` jsonb not null
- `normalized_payload` jsonb not null
- `qualification_status` text not null (`pending`, `qualified`, `rejected`)
- `lead_status` text not null (`new`, `evaluated`, `dispatched`, `closed`)
- `priority_tier` text nullable
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- (`tenant_id`, `lead_status`, `created_at desc`)
- (`tenant_id`, `qualification_status`)
- GIN (`normalized_payload`)

### `core.lead_events` (partitioned)
Purpose: Append-only lifecycle journal.

Columns:
- `id` UUID PK
- `tenant_id` UUID not null
- `lead_id` UUID FK -> `core.leads(id)`
- `event_type` text not null
- `event_version` integer not null default 1
- `event_payload` jsonb not null
- `occurred_at` timestamptz not null
- `created_at` timestamptz not null default now()

Partitioning:
- RANGE (`occurred_at`) monthly partitions
- pre-create next 3–6 months via scheduled migration job

Indexes per partition:
- (`tenant_id`, `lead_id`, `occurred_at desc`)
- (`event_type`, `occurred_at desc`)

---

## 4.4 Routing and Dispatch

### `core.routing_decisions`
Purpose: Persisted scoring and selected provider set.

Columns:
- `id` UUID PK
- `tenant_id` UUID FK
- `lead_id` UUID FK
- `rule_version` text not null
- `mode` text not null (`dry_run`, `commit`)
- `candidate_count` integer not null
- `selected_count` integer not null
- `score_breakdown` jsonb not null
- `decision_reason` text nullable
- `created_by` UUID FK -> `core.users(id)` nullable (system if null)
- `created_at` timestamptz not null

Indexes:
- (`tenant_id`, `lead_id`, `created_at desc`)
- (`rule_version`)

### `core.dispatches`
Purpose: Outbound lead delivery attempts and outcomes.

Columns:
- `id` UUID PK
- `tenant_id` UUID FK
- `lead_id` UUID FK
- `provider_id` UUID FK
- `routing_decision_id` UUID FK
- `dispatch_channel` text not null (`api`, `email`, `sms`)
- `status` text not null (`queued`, `sent`, `delivered`, `accepted`, `declined`, `failed`)
- `attempt_count` integer not null default 0
- `last_error` text nullable
- `dispatched_at` timestamptz nullable
- `finalized_at` timestamptz nullable
- `created_at`, `updated_at`

Constraints:
- unique (`lead_id`, `provider_id`, `routing_decision_id`)

---

## 4.5 Ads and Attribution

### `core.campaigns`
Purpose: Tenant-owned ad campaign metadata.

Columns:
- `id` UUID PK
- `tenant_id` UUID FK
- `name` text not null
- `status` text not null (`draft`, `active`, `paused`, `ended`)
- `pricing_model` text not null (`cpc`, `cpm`, `fixed`)
- `budget_amount` numeric(12,2) nullable
- `start_at`, `end_at` timestamptz
- `targeting_json` jsonb not null
- `created_at`, `updated_at`, `deleted_at`

### `core.ad_events` (partitioned)
Purpose: Impression/click/conversion event stream.

Columns:
- `id` UUID PK
- `tenant_id` UUID not null
- `campaign_id` UUID FK -> `core.campaigns(id)`
- `event_type` text not null (`impression`, `click`, `conversion`)
- `event_payload` jsonb not null
- `fraud_score` numeric(5,2) nullable
- `occurred_at` timestamptz not null
- `created_at` timestamptz not null default now()

Partitioning:
- RANGE (`occurred_at`) monthly

Indexes per partition:
- (`tenant_id`, `campaign_id`, `occurred_at desc`)
- (`event_type`, `occurred_at desc`)

---

## 4.6 Billing Mirror Data

### `core.subscriptions`
Purpose: Internal mirror of Stripe subscription lifecycle.

Columns:
- `id` UUID PK
- `tenant_id` UUID FK
- `stripe_subscription_id` text unique not null
- `stripe_customer_id` text not null
- `plan_tier` text not null
- `status` text not null
- `billing_interval` text not null (`month`, `year`)
- `current_period_start`, `current_period_end` timestamptz
- `cancel_at_period_end` boolean not null default false
- `created_at`, `updated_at`

Constraints:
- one active subscription per tenant + plan family invariant (partial unique index)

### `core.invoices`
- `id`, `tenant_id`, `subscription_id`, `stripe_invoice_id` unique
- amount due/paid, currency, status, due date, paid_at, created_at/updated_at

### `core.payments`
- `id`, `tenant_id`, `invoice_id`, `stripe_payment_intent_id` unique
- amount, currency, status, failure_code, processed_at, created_at/updated_at

---

## 4.7 Audit and Compliance

### `audit.audit_logs`
Purpose: Immutable trace for privileged and financial actions.

Columns:
- `id` UUID PK
- `tenant_id` UUID nullable (platform/global actions may be null)
- `actor_user_id` UUID nullable
- `actor_type` text not null (`user`, `system`, `service_account`)
- `action` text not null
- `resource_type` text not null
- `resource_id` text not null
- `change_set` jsonb nullable
- `ip_address` inet nullable
- `correlation_id` UUID nullable
- `occurred_at` timestamptz not null

Constraints:
- no updates/deletes at application layer

---

## 4.8 Operational Control Tables

### `ops.idempotency_keys`
- `id` UUID PK
- `tenant_id` UUID nullable
- `key` text not null
- `request_hash` text not null
- `response_code` integer nullable
- `response_body` jsonb nullable
- `created_at` timestamptz not null
- `expires_at` timestamptz not null

Constraint:
- unique (`tenant_id`, `key`)

### `ops.outbox_events`
Purpose: Transactional outbox for asynchronous workflows.

Columns:
- `id`, `aggregate_type`, `aggregate_id`, `event_type`, `payload`, `status`, `attempt_count`, `next_attempt_at`, `created_at`, `processed_at`

Indexes:
- (`status`, `next_attempt_at`)

---

## 5) Referential Integrity and Transaction Rules

1. Enforce foreign keys across all core relationships.
2. Use transactional boundaries for multi-table writes (e.g., lead + lead_event + outbox_event).
3. Keep event tables append-only; corrections via compensating events.
4. Use optimistic concurrency (`updated_at` checks or version columns) for high-contention records.

---

## 6) Indexing Strategy Summary

- **Operational lookup indexes:** tenant + status + created_at patterns
- **JSON search indexes:** GIN on selected payload columns used for filtering
- **Partial indexes:** active/non-deleted subsets for high-selectivity reads
- **Unique business invariants:** membership uniqueness, active subscription constraints

Review cadence:
- Monthly slow query analysis
- Reindex and bloat management plan for high-write partitions

---

## 7) Partitioning, Archival, and Retention

Partition targets:
- `core.lead_events`
- `core.ad_events`

Retention examples (tenant/legal-profile driven):
- Lead event raw payload: 24 months default
- Ad event raw payload: 18 months default
- Audit logs: 7 years (or stricter legal requirement)

Archival approach:
- Periodic extraction to object storage/data lake
- Maintain checksum and replay metadata for auditability

---

## 8) Security and Compliance Controls

- Row-level security (RLS) optional phase 2; application-enforced tenant filters mandatory phase 1
- Encryption at rest at volume/storage layer
- Field-level encryption/tokenization for sensitive PII
- Restricted direct DB access with break-glass logging
- Data subject export/deletion workflows integrated via n8n compliance jobs

---

## 9) Migration and Release Standards

- Forward-only migrations in source control
- Zero-downtime migration patterns:
  1. Add nullable column
  2. Backfill asynchronously
  3. Add constraints/indexes concurrently
  4. Switch reads/writes
  5. Remove deprecated columns in later release
- Migration checks in CI and staging restore rehearsal before prod rollout

---

## 10) Initial DDL Implementation Backlog

- [ ] Create schemas: `core`, `audit`, `ops`, `ref`
- [ ] Implement core tenancy/identity/provider tables + constraints
- [ ] Implement leads/routing/dispatch tables + event journal partitions
- [ ] Implement ads + billing mirror tables
- [ ] Implement audit and outbox/idempotency tables
- [ ] Seed reference data (`service_categories`, plan metadata)
- [ ] Add baseline indexes and partition automation scripts
- [ ] Validate with integration tests for key transactions

