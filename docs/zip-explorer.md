# ZIP Explorer Architecture

This PR adds a Census-first ZIP Explorer funnel in the Vite + React SPA.

## File map
- Route/page: `src/pages/ZipExplorer.tsx`, `src/pages/ZipExplorerHub.tsx`
- Hooks: `src/hooks/useZipExplorer.ts`, `src/hooks/useZipSearch.ts`
- Feature core: `src/features/zip-explorer/*`
- UI modules: `src/components/zip-explorer/*`
- SEO helpers: `src/components/seo/*`, `src/features/zip-explorer/seo.ts`

## Functional vs stubbed
- **Functional now:** ZIP validation, Supabase Edge Function Census proxy wiring, query caching, section rendering, conversion CTAs, internal links.
- **Stubbed intentionally:** AirNow, Walk Score, GreatSchools, Kluje Risk adapters return graceful unavailable states until proxy/server integration is added.

## Limitations
- Client-rendered metadata is included but depends on crawler JS execution.
- Optional data providers are disabled by default unless env vars are supplied.
- Nearby ZIP links use a placeholder strategy for now.

## Testing checklist
- Load `/zip/90210` and verify hero, stats, and source statuses.
- Enter invalid ZIP and verify invalid state.
- Disable the `zip-explorer-census-proxy` Census secret (`CENSUS_API_KEY`) and verify disabled/unavailable Census message.
- Configure only one optional provider and verify partial-availability status.

## Rollout checklist
1. Set `CENSUS_API_KEY` (and optional `CENSUS_API_BASE_URL`) as Supabase Edge Function secrets for `zip-explorer-census-proxy`.
2. Verify canonical URL domain via `VITE_PUBLIC_SITE_URL`.
3. QA conversion links to `/browse-providers`, `/post-job`, `/contractor/quote-intake`.
4. Monitor route indexation and crawl behavior.

## Next repo-only PR recommendations
- Add pre-render/SSR for `/zip/:zipCode` and hub pages.
- Add server proxy endpoints for optional providers (AirNow/Walk Score/GreatSchools/Kluje Risk).
- Add deterministic nearby ZIP logic from geospatial data.
