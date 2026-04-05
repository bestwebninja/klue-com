

# Command Center Dashboard — Current State Review

## What's Working

The **Remodeling Command Center** at `/command-center/remodeling` renders a polished, navy/gold themed dashboard with:

- **Header**: Kluje branding, workspace switcher, voice mic button, search bar, notification badge (4), user profile
- **Sidebar**: Two grouped sections (Operations: Today, Pipeline, Analytics, AI Agents; Systems: Compliance, Integrations, Settings) with active state highlighting and icons
- **KPI Cards (4)**: Emergency Mix (38%), Average Ticket ($12.4k), Material Variance (-1.8%), Leak Detection ROI (4.6x) — each with delta badges and bar-chart sparklines
- **Pipeline Board**: 4-column Kanban (New, Dispatch, In Progress, Complete) with priority badges, owners, and ETAs
- **AI Agents (3)**: Leak Hunter (active), Document Whisperer (idle), Rebate Maximizer (active) — each with Run/Configure buttons
- **Footer**: Online status indicator, last sync time, Export CSV/PDF buttons

## Issues Found

### 1. The `/command-center/:workspaceId/trade/:tradeKey` route shows a blank white page
The `TradeCommandCenterPage` route fails with a **502 error** loading `dashboardTemplateService.ts`. This is likely a Vite module resolution issue in the dev server — the generic template-driven page cannot load while the standalone `RemodelingCommandCenterPage` works fine because it has no external service imports.

**Fix**: Investigate the 502 on `dashboardTemplateService.ts`. This may be caused by a circular import or a large import chain. The simplest fix is to inline the template lookup in `TradeCommandCenterPage` or verify all template files compile cleanly.

### 2. Duplicate implementations
There are now **two** remodeling dashboards:
- `RemodelingCommandCenterPage.tsx` — standalone, hardcoded, navy/gold themed (works)
- `TradeCommandCenterPage.tsx` — template-driven, uses shared layout components (broken)

**Recommendation**: Keep the standalone `RemodelingCommandCenterPage` as the production version since it works and looks polished. Fix the template-driven route separately, then migrate to it once stable.

### 3. The `?section=home` default on TradeCommandCenterPage
When the generic trade route works, it defaults to `?section=home` which renders `MyDashboardView` (a generic "My Dashboard" with `RoleBasedDashboardHome`), not the trade-specific KPIs/pipeline. Users have to manually click "Today" to see the actual command center content.

**Fix**: Default to `?section=today` instead, or render the trade dashboard content directly on the home section.

### 4. Cookie banner overlap
The cookie consent banner overlaps the bottom of the AI Agents section and footer. This is cosmetic but worth noting.

## Recommended Next Steps

1. **Fix the 502 error** on `dashboardTemplateService.ts` to restore the template-driven trade routes
2. **Consolidate** the two remodeling page implementations into one
3. **Default section** to "today" instead of "home" so users land on the operational dashboard
4. **Add a right rail** to `RemodelingCommandCenterPage` (alerts, weather, compliance, quick actions) — the template data exists but the standalone page doesn't render it

## Files Involved

| File | Status | Issue |
|------|--------|-------|
| `RemodelingCommandCenterPage.tsx` | Working | Standalone, no right rail |
| `TradeCommandCenterPage.tsx` | Broken (502) | Template service import fails |
| `dashboardTemplateService.ts` | 502 in dev | Module resolution error |
| `CommandCenterSidebar.tsx` | Working | TypeScript `as const` fix already applied |

