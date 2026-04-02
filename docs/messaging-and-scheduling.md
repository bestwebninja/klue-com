# Messaging & Scheduling Primitives

## Scope
This implementation adds tenant-scoped marketplace messaging and appointment coordination primitives across schema, API surface, handlers/services, and n8n automation.

## Data Model
Added to `infra/db/schema.sql`:
- `threads`: conversation container bound to tenant, lead, and participants.
- `messages`: immutable message log bound to thread + sender.
- `appointments`: scheduling primitive tied to thread/lead/provider/customer.
- `reminders`: queue model for appointment reminders and no-response nudges.

Also added indexes for common query patterns (tenant/update time, thread chronology, appointment start, reminder due scans).

## API Endpoints
Added to `apps/api/openapi.yaml` and route handlers:

### Messaging
- `POST /api/v1/messages/threads`
  - Creates a thread and optionally sends initial message.
- `GET /api/v1/messages/threads/{threadId}`
  - Returns thread + message timeline.
- `POST /api/v1/messages/threads/{threadId}/messages`
  - Sends a message and queues no-response nudge reminder.

### Scheduling
- `POST /api/v1/appointments`
  - Creates appointment and queues reminder.
- `PATCH /api/v1/appointments/{appointmentId}`
  - `action=reschedule` updates time windows.
  - `action=cancel` marks canceled with required reason.

## Services
- `apps/api/src/services/messaging/store.ts`
  - In-memory + optional Supabase persistence for threads/messages/reminders.
  - Shared audit event appends to `events` table.
- `apps/api/src/services/messaging/service.ts`
  - Thread create/get/send flows.
  - No-response nudge generation when a message is sent.
- `apps/api/src/services/appointments/service.ts`
  - Appointment create/get/patch flows.
  - 24h pre-appointment reminder generation.

## Tenant Scoping & Audit
- All new routes require auth and tenant context from `x-tenant-id` middleware.
- Services verify tenant ownership before reads/writes.
- Each mutating operation emits an audit event type:
  - `messaging.thread.created`
  - `messaging.message.sent`
  - `appointments.created`
  - `appointments.rescheduled`
  - `appointments.cancelled`

## n8n Workflows
Added:
- `n8n/workflows/appointment-reminders.json`
  - Poll queued appointment reminders, send notifications, mark as sent.
- `n8n/workflows/no-response-nudges.json`
  - Poll due no-response reminders, send in-app nudges, emit event, mark sent.

These workflows follow the existing architecture pattern: scheduled trigger, fetch due workload, batch split, delivery call, state update.
