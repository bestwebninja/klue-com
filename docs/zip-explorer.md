# ZIP Explorer Architecture

This module is a Census-first ZIP Explorer funnel in the Vite + React SPA.

## File map
- Route/page: `src/pages/ZipExplorer.tsx`, `src/pages/ZipExplorerHub.tsx`
- Hooks: `src/hooks/useZipExplorer.ts`, `src/hooks/useZipSearch.ts`
- Feature core: `src/features/zip-explorer/*`
- UI modules: `src/components/zip-explorer/*`
- SEO helpers: `src/components/seo/*`, `src/features/zip-explorer/seo.ts`
- Supabase proxies: `supabase/functions/census-zip-profile`, `supabase/functions/command-center-adapter-proxy`

## Provider status
- **Functional now:** ZIP validation, Census adapter wiring, query caching, section rendering, conversion CTAs, internal links.
- **Proxy-wired (server-side status + config checks):** AirNow, Walk Score, GreatSchools, Kluje Risk now call `command-center-adapter-proxy` instead of relying on browser-exposed provider keys.
- **Still pending upstream mapping:** Optional provider payload transforms are not implemented yet, so these providers can still return graceful `unavailable` until backend mappings are added.

## Limitations
- Client-rendered metadata is included but depends on crawler JS execution.
- Optional providers may remain unavailable when proxy secrets are missing or upstream mapping is incomplete.
- Nearby ZIP links use a placeholder strategy for now.

## Testing checklist
- Load `/zip/90210` and verify hero, stats, and source statuses.
- Enter invalid ZIP and verify invalid state.
- Remove `CENSUS_API_KEY` secret and verify Census source-status error.
- Remove one optional provider secret pair and verify proxy returns a provider-specific unavailable reason.

## Rollout checklist
1. Set Census and optional-provider secrets in Supabase.
2. Verify canonical URL domain via `VITE_PUBLIC_SITE_URL`.
3. QA conversion links to `/browse-providers`, `/post-job`, `/contractor/quote-intake`.
4. Monitor route indexation and crawl behavior.

## Next repo-only PR recommendations
- Implement upstream fetch + normalization in `command-center-adapter-proxy` per optional provider.
- Add pre-render/SSR for `/zip/:zipCode` and hub pages.
- Add deterministic nearby ZIP logic from geospatial data.
