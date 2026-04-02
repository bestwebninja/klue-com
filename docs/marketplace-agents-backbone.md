# Marketplace Agent Backbone (A0–A8)

This document captures the v1 backbone implementation for enterprise marketplace agents.

## Implemented assets
- Shared contracts: `packages/shared/src/marketplace-agents.ts`
- API routes: `/api/v1/marketplace-agents/*`
- Service stubs: deterministic task store, transitions, router decisions, workflow templates
- DB schema additions: task, decision, workflow template tables
- n8n workflow templates for intake, quote advising, and support triage

## Deterministic v1 stance
The implementation is intentionally rules-first with explicit extension seams for AI/ML.

## Integration note: Area Risk
A7 compliance decisions should consume the existing `areaRiskBand` context sourced from `/api/v1/area-risk/score`.
