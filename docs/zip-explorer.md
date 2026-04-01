# ZIP Explorer

## Architecture
ZIP Explorer is a repo-local, public React vertical under `/zip/:zipCode`.
- Route-level lazy loading is wired in `src/App.tsx`.
- `src/pages/ZipExplorer.tsx` orchestrates state rendering and SEO.
- `src/hooks/useZipExplorer.ts` collects provider data with TanStack Query and normalizes to a single UI model.
- `src/features/zip-explorer/*` contains typed adapters, request builders, formatters, validators, and scoring.

## File map
- `src/pages/ZipExplorer.tsx`
- `src/hooks/useZipExplorer.ts`
- `src/hooks/useZipSearch.ts`
- `src/features/zip-explorer/*`
- `src/components/zip-explorer/*`

## Provider responsibilities
- Census adapter: functional, canonical source for demographics/housing (ACS 2024 profile + detailed).
- AirNow adapter: functional only when browser-safe base URL + key exist.
- Walk Score adapter: stub (proxy-required).
- GreatSchools adapter: stub (proxy-required).
- Kluje Risk adapter: stub (API contract pending/proxy-required).

## Env vars
- `VITE_PUBLIC_SITE_URL`
- `VITE_CENSUS_API_BASE_URL`
- `VITE_CENSUS_API_KEY`
- `VITE_AIRNOW_API_BASE_URL`
- `VITE_AIRNOW_API_KEY`
- `VITE_WALKSCORE_API_BASE_URL`
- `VITE_WALKSCORE_API_KEY`
- `VITE_GREATSCHOOLS_API_BASE_URL`
- `VITE_GREATSCHOOLS_API_KEY`
- `VITE_KLUJE_RISK_API_BASE_URL`
- `VITE_KLUJE_RISK_API_KEY`

## Implemented vs stubbed
Implemented:
- ZIP route integration
- ZIP page sections/states
- Census request builders/adapters
- model normalization and derived scoring

Stubbed:
- Walk Score
- GreatSchools
- Kluje risk endpoint

## Rollout notes
- Public route, no auth dependency.
- Missing provider config never crashes UI; each source reports status.
- Keys that are unsafe for browser usage should be treated as placeholders and replaced with proxy-backed endpoints.

## Next repo-only PR suggestions
1. Add backend proxy endpoints for Walk Score/GreatSchools/Kluje risk and switch adapters to those endpoints.
2. Add ZIP sitemap generation and pre-render strategy for highest traffic ZIPs.
3. Add observability events for ZIP searches and CTA conversion.
