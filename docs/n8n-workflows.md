# Kluje Enterprise n8n Workflow Specification

**Document Owner:** Automation Engineering  
**Version:** 1.0  
**Status:** Implementation Blueprint  
**Last Updated:** 2026-03-29  
**Workflow Platform:** n8n  
**Aligned Spec:** `/docs/enterprise-build-spec.md`

---

## 1) Purpose and Scope

This document defines the canonical n8n workflow architecture supporting lead operations, dispatch orchestration, billing operations, notifications, and compliance automation. It provides concrete workflow contracts, reliability patterns, and operational standards required for enterprise readiness.

### In Scope
- Workflow domains and responsibilities
- Input/output contracts and validation
- Retry, dead-letter, and idempotency patterns
- Secrets and security controls
- Monitoring, alerting, and runbook requirements

### Out of Scope
- Detailed API implementation internals
- UI-level behavior in the React application

---

## 2) Platform Standards for All Workflows

Each workflow must define:
1. **Owner** (team + secondary escalation)
2. **SLA/SLO** (execution latency and success target)
3. **Runbook link**
4. **Version identifier**
5. **Input schema and output schema**
6. **Idempotency strategy**
7. **Failure policy** (retry + dead-letter)

### Global Technical Requirements
- Strict JSON schema validation at entry points.
- Correlation ID propagated across all nodes and downstream calls.
- Secrets loaded from central vault integrations only.
- Structured logs for node-level execution outcomes.
- PII redaction rules enforced in logs and alert payloads.

---

## 3) Workflow Domain Catalog

## 3.1 Lead Intake Automation Workflow

### Objective
Validate and enrich inbound lead payloads before canonical lead creation.

### Trigger(s)
- Webhook trigger from API service outbox event (`lead.intake.requested`)
- Optional scheduled replay for failed enrichments

### Steps
1. Validate required fields against lead intake schema.
2. Normalize taxonomy and location data.
3. Enrich with third-party signals (if configured).
4. Call API to persist lead + initial lifecycle event.
5. Emit `lead.qualified` or `lead.rejected` event.

### Failure Handling
- Retry transient enrichment/API errors with exponential backoff.
- Hard validation failures route to rejection path (no retry).
- After max retries, emit dead-letter event and alert operations.

### SLA Target
- 95% complete within 60 seconds from trigger.

---

## 3.2 Partner Dispatch Workflow

### Objective
Deliver qualified leads to selected providers/partners with retry safety and outcome capture.

### Trigger(s)
- Event trigger from routing service (`lead.dispatch.requested`)

### Steps
1. Fetch dispatch target list and channel preferences.
2. For each target, invoke partner endpoint/channel adapter.
3. Apply per-target timeout and retry policy.
4. Record attempt outcomes (`delivered`, `failed`, etc.) via API callback.
5. Emit aggregate dispatch completion event.

### Control Features
- Concurrency limits to protect partner endpoints.
- Circuit breaker for partners with elevated error rates.
- Throttling for premium/priority routes where contract rules apply.

### Failure Handling
- Per-target retries for transient failures.
- Poison payloads to dead-letter queue/workflow.
- Optional fallback dispatch channel (e.g., email) if API delivery repeatedly fails.

### SLA Target
- 99% of dispatch attempts initiated within 2 minutes of request.

---

## 3.3 Notification Workflow

### Objective
Send transactional notifications and internal alerts for lead, billing, and incident events.

### Trigger(s)
- Event subscriptions: lead lifecycle, routing outcomes, billing failures, compliance jobs

### Steps
1. Resolve recipient set and communication preferences.
2. Render approved templates with localization variables.
3. Send through provider adapters (email/SMS/webhook).
4. Record delivery metadata and provider response IDs.

### Guardrails
- Template version pinning.
- Preference/opt-out policy checks.
- Rate control for repeated failure notifications.

### SLA Target
- 95% of notifications sent within 90 seconds.

---

## 3.4 Billing Operations Workflow

### Objective
Automate operational handling around Stripe lifecycle and payment recovery processes.

### Trigger(s)
- Stripe webhook ingestion events forwarded from API
- Scheduled dunning tasks

### Steps
1. Validate event signature status passed by API gateway layer.
2. Deduplicate using Stripe event ID/idempotency key.
3. Sync subscription/invoice/payment mirrors via billing APIs.
4. Trigger dunning sequence on payment failure.
5. Update CRM/finance channels for enterprise account managers.

### Failure Handling
- Retry transient API/database errors.
- Dead-letter unknown/poison events with operator action required.
- Escalate repeated `invoice.payment_failed` patterns for account intervention.

### SLA Target
- 99% of billing events processed within 5 minutes.

---

## 3.5 Compliance Workflow

### Objective
Execute data governance operations for retention, export, and deletion requirements.

### Trigger(s)
- Scheduled retention windows
- Manual/legal request initiation
- Tenant policy change events

### Steps
1. Determine policy scope by tenant legal profile.
2. Enumerate eligible records and validate hold exceptions.
3. Execute deletion, anonymization, or export tasks.
4. Write compliance audit entries and completion evidence.
5. Notify compliance/admin stakeholders.

### Failure Handling
- Halt on policy ambiguity and escalate for manual approval.
- Retry infrastructure failures; no silent drops.
- Preserve immutable evidence trail of attempted and completed operations.

### SLA Target
- Regulatory request SLA must meet tenant contractual terms.

---

## 4) Data Contracts and Message Patterns

## 4.1 Canonical Event Envelope

```json
{
  "event_id": "uuid",
  "event_type": "lead.dispatch.requested",
  "event_version": 1,
  "tenant_id": "uuid",
  "correlation_id": "uuid",
  "occurred_at": "2026-03-29T00:00:00Z",
  "payload": {}
}
```

Required rules:
- `event_id` globally unique and used for dedupe.
- `event_version` incremented for breaking payload changes.
- Unknown future fields tolerated by consumers.

## 4.2 Schema Governance

- Contract files versioned in source control.
- Validation node at workflow ingress.
- Contract compatibility check in CI before workflow promotion.

---

## 5) Idempotency, Retries, and Dead-Letter Design

## 5.1 Idempotency

- Use `event_id` or domain idempotency key as execution key.
- Workflow must check `ops.idempotency_keys`-equivalent store/API prior to side effects.
- Duplicate events return prior result or no-op with traceable log entry.

## 5.2 Retry Policy Baseline

- Retryable categories: network timeout, 5xx responses, temporary dependency outages.
- Non-retryable categories: schema validation errors, authorization failures, unsupported versions.
- Default schedule: exponential backoff with jitter (e.g., 30s, 2m, 10m).

## 5.3 Dead-Letter Handling

Dead-letter payload must include:
- original event envelope
- failure reason and stack metadata
- attempt count and timestamps
- workflow version and node identifier

Operational requirement:
- Dead-letter queue monitored with paging thresholds and replay tooling.

---

## 6) Security and Secrets for n8n

- Central secret vault integration only; no plaintext credentials in workflow definitions.
- Scoped credentials per environment (dev/staging/prod isolation).
- Minimum required permissions for all downstream APIs.
- Signed callback/webhook verification prior to processing sensitive events.
- Workflow change audit logs enabled and retained per compliance policy.

---

## 7) Observability and Operational Runbooks

## 7.1 Metrics

Track at minimum:
- execution count, success rate, failure rate
- p50/p95 execution duration
- retry volume and retry success rate
- dead-letter volume by workflow/event type

## 7.2 Logging

Each execution log must capture:
- workflow ID/version
- tenant ID
- correlation ID
- trigger source
- terminal status and error taxonomy

## 7.3 Alerting

Alert thresholds:
- sustained failure rate > target over rolling window
- dead-letter backlog above threshold
- latency SLO violations
- webhook ingestion lag (billing-critical)

## 7.4 Runbook Minimum Content

- Symptom patterns and likely causes
- Verification queries/checks
- Immediate mitigation options
- Replay/reprocessing instructions
- Escalation path and ownership

---

## 8) Deployment and Change Management for Workflows

- Workflow definitions versioned in git and promoted via CI/CD.
- No direct production edits except break-glass process.
- Staging validation required with synthetic and replayed event fixtures.
- Gradual activation (subset routing or tenant canary) for major workflow revisions.

Rollback strategy:
- Preserve previous workflow version and quick reactivation path.
- Compatibility mode for in-flight events during rollback window.

---

## 9) Initial Workflow Backlog

- [ ] Implement lead intake workflow with schema validation + enrichment hooks
- [ ] Implement partner dispatch workflow with bounded concurrency and retries
- [ ] Implement notification workflow with template versioning
- [ ] Implement billing ops workflow for Stripe lifecycle events + dunning
- [ ] Implement compliance workflow for retention/export/deletion automation
- [ ] Add shared observability nodes and correlation ID propagation standards
- [ ] Add dead-letter monitoring and replay tools

