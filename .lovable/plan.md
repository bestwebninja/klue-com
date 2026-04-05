

# Command Center Repo Review — Current State and Issues

## What's Working

- **Standalone Remodeling Dashboard** (`/command-center/remodeling`): Fully rendered with navy/gold theme, header with Kluje branding, sidebar, 4 KPI cards with sparklines, 4-column Kanban pipeline, 3 AI agents, right rail (alerts, weather, compliance, quick actions), and footer with export buttons.
- **Shared Layout Components**: `CommandCenterLayout`, `CommandCenterHeader`, `CommandCenterSidebar`, `CommandCenterRightRail`, `CommandCenterFooter` — all functional and well-structured.
- **Template System**: 10 trade/audience templates (plumbing, electrical, HVAC, roofing, remodeling, finishing, landscaping, windows/doors, finance, title) with rich config data including KPIs, pipeline items, agents, right rail, and sidebar nav.
- **Reusable Components**: `KPIInsightCard`, `PipelineBoard`, `AgentPanel`, `SimulatorPanel`, `RiskHeatMap`, `DocumentDrawer` — all exist and are importable.
- **Finance & Title Pages**: Render via `CommandCenterLayout` with KPI cards, though minimal content.

## Critical Issue: Template Key Mismatch

`TradeCommandCenterPage` calls `getTemplateByKey(tradeKey)` where `tradeKey` comes from the URL param (e.g. `"plumbing"`). But template keys are prefixed: `"trade_plumbing_v1"`, `"trade_hvac_v1"`, etc. **No template will ever match**, so every non-remodeling trade route shows the error fallback: "Command Center template failed to load."

### Fix Options (pick one)
1. Change `getTemplateByKey` call to use `getTemplateByAudience("trade", tradeKey as TradeKey)` — this already exists and matches on the `trade` field
2. Add a new lookup function that matches by trade field directly
3. Change all template keys to match URL params (breaking change, not recommended)

**Recommendation**: Option 1 — replace `getTemplateByKey(tradeKey)` with `getTemplateByAudience("trade", tradeKey as TradeKey)` in `TradeCommandCenterPage.tsx`. This is a one-line fix.

## Secondary Issue: Empty Trade Page Content

Even after the template loads, `TradeCommandCenterPage` only renders `Section: {section}` as its children. It doesn't use the template's KPIs, pipeline, or agents. The page needs to render actual dashboard content using the template config.

### Fix
Render KPI cards, pipeline board, and agent panels inside `CommandCenterLayout` using the template's config data, similar to how `FinanceCommandCenterPage` renders KPIs.

## Other Issues Carried Forward

| Issue | Status | Priority |
|-------|--------|----------|
| Duplicate remodeling implementations | Still exists | Medium |
| Cookie banner overlap on footer | Still present | Low |

## Implementation Plan

### Step 1 — Fix template lookup in TradeCommandCenterPage
In `TradeCommandCenterPage.tsx`, replace:
```ts
const template = dashboardTemplateService.getTemplateByKey(tradeKey || '');
```
with:
```ts
const template = dashboardTemplateService.getTemplateByAudience('trade', tradeKey as TradeKey);
```
Add `TradeKey` to imports from types.

### Step 2 — Render trade dashboard content
Replace the placeholder `Section: {section}` with actual dashboard content using template config:
- KPI cards grid using `KPIInsightCard`
- `PipelineBoard` with `template.config.pipelineItems`
- Agent cards using `AgentPanel`

Pass `config={template.config}` to `CommandCenterLayout` (already done) so sidebar and right rail populate automatically.

### Step 3 — Pass right rail config
Ensure `config` prop flows through to `CommandCenterRightRail` — this is already wired in `CommandCenterLayout`.

### Files to Change
- `src/features/command-center/pages/TradeCommandCenterPage.tsx` — fix lookup + add content rendering

