# Census ZIP Explorer proxy setup

ZIP Explorer Census calls are server-side through the Supabase Edge Function `census-zip-profile`.
This keeps the Census API key out of browser bundles while preserving the existing `/zip/:zipCode` route and UI behavior.

## Census architecture (current)

1. Browser page (`src/pages/ZipExplorer.tsx`) loads ZIP route and calls `useZipExplorer`.
2. Hook uses the Census adapter (`fetchCensusByZip`) which calls `fetchCensusZipProfile`.
3. API layer invokes `supabase.functions.invoke("census-zip-profile")`.
4. Edge function validates ZIP input, reads `CENSUS_API_KEY` from Supabase secrets, calls ACS Profile + Detailed endpoints, and returns normalized JSON.

## Optional-provider proxy boundary (current)

- AirNow, Walk Score, GreatSchools, and Kluje Risk adapters invoke `command-center-adapter-proxy`.
- The proxy validates provider + ZIP input and checks provider secret presence server-side.
- Until provider-specific upstream mapping is implemented, the proxy returns intentional `unavailable` statuses with reason text.

## Required secret

Set this in Supabase project secrets (not in frontend `.env`):

- `CENSUS_API_KEY`: your Census Bureau API key.

```bash
supabase secrets set CENSUS_API_KEY=your_real_key
```

## Optional-provider secrets (server-side only)

```bash
supabase secrets set AIRNOW_API_BASE_URL=https://example AIRNOW_API_KEY=your_real_key
supabase secrets set WALKSCORE_API_BASE_URL=https://example WALKSCORE_API_KEY=your_real_key
supabase secrets set GREATSCHOOLS_API_BASE_URL=https://example GREATSCHOOLS_API_KEY=your_real_key
supabase secrets set KLUJE_RISK_API_BASE_URL=https://example KLUJE_RISK_API_KEY=your_real_key
```

## Deploy

```bash
supabase functions deploy census-zip-profile
supabase functions deploy command-center-adapter-proxy
```

## Local development

Serve functions with local secrets:

```bash
supabase secrets set --env-file .env.local
supabase functions serve census-zip-profile
supabase functions serve command-center-adapter-proxy
```

`.env.local` should include:

```bash
CENSUS_API_KEY=your_real_key
AIRNOW_API_BASE_URL=https://example
AIRNOW_API_KEY=your_real_key
WALKSCORE_API_BASE_URL=https://example
WALKSCORE_API_KEY=your_real_key
GREATSCHOOLS_API_BASE_URL=https://example
GREATSCHOOLS_API_KEY=your_real_key
KLUJE_RISK_API_BASE_URL=https://example
KLUJE_RISK_API_KEY=your_real_key
```

## Frontend env expectations

- Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` set for browser invocation.
- Do **not** add Census or optional-provider keys as `VITE_*` values.

## Behavior notes

- Route structure and existing ZIP Explorer screens are unchanged.
- Census failures surface as source-status errors while other providers can still render.
- Optional-provider failures are now resolved by server-side proxy status checks rather than browser env checks.
- When only some providers fail, ZIP Explorer still renders available sections and displays partial availability messaging.
