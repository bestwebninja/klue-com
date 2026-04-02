# Customer Concierge API v1

This document describes the lightweight deterministic concierge API for marketplace intake guidance.

## Goals

- Provide **category suggestion** from customer free-text input.
- Provide **intake guidance** checklists to improve lead quality.
- Provide **FAQ-style marketplace responses** for common customer questions.
- Persist sessions/messages for conversation continuity and analytics.
- Keep v1 deterministic/rules-based while exposing hooks for future AI orchestration.

## Endpoints

### `POST /api/v1/concierge/respond`

Accepts a message and optional `sessionId`. If no session exists, a new one is created.

Behavior:
- Classifies response type (`category_suggestion`, `intake_guidance`, or `faq_response`) with deterministic rules.
- Uses keyword maps for category suggestion (`plumbing`, `electrical`, `hvac`).
- Applies FAQ keyword templates for pricing/verification/timeline.
- Returns response text, confidence score, checklist items, FAQ references, extension hooks, and full session messages.

### `GET /api/v1/concierge/sessions/{sessionId}`

Returns the persisted session + full message history.

## Persistence model

### `concierge_sessions`
- Session lifecycle metadata (`active|closed`), channel, tenant linkage.
- `marketplace_context` for UI/client metadata.
- `guidance_state` for deterministic state snapshots.
- `ai_extension_hook` for future AI copilot upgrade flags.

### `concierge_messages`
- Message-level log for customer/concierge/system.
- `message_type` to distinguish guidance vs FAQ vs category suggestion.
- `metadata` for deterministic rule details.
- `ai_extension_hook` for forward-compatible enrichment.

## Deterministic v1 extension hooks

All responses expose:

```json
{
  "extensionHooks": {
    "mode": "deterministic_v1",
    "aiReady": true,
    "suggestedPromptTemplate": "concierge_intake_triage_v2"
  }
}
```

This allows a future AI planner to:
- Re-rank category confidence.
- Generate richer follow-up prompts.
- Resolve ambiguous intents with contextual memory.
