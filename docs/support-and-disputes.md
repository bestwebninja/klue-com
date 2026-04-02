# Support and Disputes Scaffolding

## Overview

This document describes the initial scaffolding for support ticket intake, dispute management, and escalation routing across API, database, and automation layers.

## Data Model

The relational model introduces four new entities:

- `support_tickets` — canonical support intake records with issue classification, lifecycle status, and escalation state.
- `ticket_events` — immutable event stream for triage actions and support timeline observability.
- `disputes` — formal dispute records optionally linked to support tickets.
- `dispute_evidence` — evidence attachments associated with a dispute.

### Classification and Escalation Enums

Issue and escalation taxonomy is defined centrally in shared types:

- `IssueClassification`
  - `account_access`
  - `billing_payment`
  - `service_quality`
  - `provider_conduct`
  - `technical_issue`
  - `safety_incident`
  - `other`
- `EscalationState`
  - `none`
  - `pending_review`
  - `escalated_internal`
  - `escalated_external`
  - `resolved`

## API Endpoints

All endpoints are namespaced under `/api/v1/support` and require authenticated access.

### Tickets

- `POST /support/tickets`
  - Creates a support ticket and runs deterministic triage classification.
- `GET /support/tickets/{ticketId}`
  - Returns ticket details and associated event history.

### Disputes

- `POST /support/disputes`
  - Creates a dispute, optionally linked to a ticket.
- `POST /support/disputes/{disputeId}/evidence`
  - Adds an evidence item (document/image/video/chat transcript/other).
- `POST /support/disputes/{disputeId}/escalate`
  - Escalates dispute state to internal operations review.

## Service Layer

Support services currently use in-memory stores to provide scaffolding for future persistence integration:

- ticket creation and triage (`supportService.createTicket`)
- ticket retrieval with event stream (`supportService.getTicket`)
- dispute creation (`supportService.createDispute`)
- evidence attachment (`supportService.addDisputeEvidence`)
- escalation transitions (`supportService.escalateDispute`)

## n8n Workflow

`n8n/workflows/support-dispute-escalation.json` adds workflow-level escalation handling:

1. Ingests `support.dispute.escalated` webhook events.
2. Validates event envelope integrity.
3. Creates an internal ops incident alert.
4. Routes safety-sensitive disputes to trust & safety paging.
5. Routes other escalations to support leadership.

This workflow is scaffold-only and assumes notification API endpoints and credentials are configured per environment.
