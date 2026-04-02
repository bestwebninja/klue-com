# Census ZIP Explorer proxy setup

ZIP Explorer Census calls are now server-side through the Supabase Edge Function `census-zip-profile`.
This keeps the Census API key out of browser bundles while preserving the existing `/zip/:zipCode` route and UI behavior.

## Architecture

1. Browser page (`src/pages/ZipExplorer.tsx`) loads ZIP route and calls `useZipExplorer`.
2. Hook uses the Census adapter (`fetchCensusByZip`) which calls `fetchCensusZipProfile`.
3. API layer invokes `supabase.functions.invoke("census-zip-profile")`.
4. Edge function validates ZIP input, reads `CENSUS_API_KEY` from Supabase secrets, calls ACS Profile + Detailed endpoints, and returns normalized JSON.

## Required secret

Set this in Supabase project secrets (not in frontend `.env`):

- `CENSUS_API_KEY`: your Census Bureau API key.

```bash
supabase secrets set CENSUS_API_KEY=your_real_key
```

## Deploy

```bash
supabase functions deploy census-zip-profile
```

## Local development

Serve the function with local secrets:

```bash
supabase secrets set --env-file .env.local
supabase functions serve census-zip-profile
```

`.env.local` should include:

```bash
CENSUS_API_KEY=your_real_key
```

## Frontend env expectations

- Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` set for browser invocation.
- Do **not** add Census keys as `VITE_*` values.

## Behavior notes

- Route structure and existing ZIP Explorer screens are unchanged.
- Census failures now surface as source-status errors while other optional providers can still render.
- When only some providers fail, ZIP Explorer still renders available sections and displays partial availability messaging.
