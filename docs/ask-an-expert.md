# Ask-an-Expert Domain Scaffolding

This document describes the initial backend and workflow scaffolding for the Ask-an-Expert domain.

## Scope delivered

- Database domain tables for questions, answers, assignments, and moderation actions.
- API contracts and handlers for question creation/listing, answer creation, and moderation review logging.
- Service modules for in-memory state + optional Supabase persistence.
- n8n workflow template to route newly created unanswered questions to a suggested expert.
- Moderation enums and unsafe-advice state taxonomy used across DB, API schema, and service validation.

## Domain entities

### `expert_questions`
Tracks user-submitted questions, lifecycle status, and unsafe-advice state.

### `expert_answers`
Stores expert responses and optional citations, with unsafe-advice state tagging.

### `expert_assignments`
Represents assignment actions from moderators/ops to specific experts.

### `moderation_actions`
Immutable moderation event log with action type and unsafe-advice state outcome.

## Status and moderation enums

- `expert_question.status`:
  - `open`
  - `assigned`
  - `answered`
  - `closed`
  - `moderation_hold`
- `unsafe_advice_state`:
  - `none`
  - `suspected`
  - `confirmed`
  - `cleared`
- `moderation_actions.action_type`:
  - `approve`
  - `reject`
  - `flag`
  - `escalate`
  - `request_changes`

## API endpoints

- `POST /api/v1/expert/questions`
- `GET /api/v1/expert/questions`
- `POST /api/v1/expert/questions/{questionId}/answers`
- `POST /api/v1/moderation/review`

## n8n routing template

Workflow: `n8n/workflows/expert-question-routing.json`

High-level flow:
1. Receive `expert.question.created` webhook payload.
2. Validate required routing fields.
3. Resolve recommended experts from provider search API.
4. Auto-select top candidate and post assignment-backed expert question payload.
5. If no candidate exists, emit `expert.question.unassigned` event.

## Follow-up implementation recommendations

1. Move in-memory domain store to primary Postgres repositories.
2. Add role-aware authorization for expert-only answer posting and moderator-only review actions.
3. Add workflow idempotency keys to prevent duplicate assignments.
4. Add read models for question detail, answer threading, and moderation timelines.
