# Census ZIP Explorer proxy setup

This project routes Census ZIP Explorer requests through a Supabase Edge Function (`census-zip-profile`) so no Census secret is exposed to browsers.

## What changed

- Browser-side Census key usage was removed from frontend config.
- ZIP Explorer Census requests now call `supabase.functions.invoke("census-zip-profile")`.
- The edge function performs upstream Census API calls with a server-side secret.

## Required secret

Set this in Supabase secrets for the deployed project:

- `CENSUS_API_KEY`: your Census API key.

Example:

```bash
supabase secrets set CENSUS_API_KEY=your_real_key
```

## Deploy function

```bash
supabase functions deploy census-zip-profile
```

## Local development

Run Supabase functions locally and set env vars for the local runtime:

```bash
supabase secrets set --env-file .env.local
supabase functions serve census-zip-profile
```

Where `.env.local` includes at least:

```bash
CENSUS_API_KEY=your_real_key
```

## Frontend behavior

- Public ZIP Explorer routes remain unchanged.
- The frontend model shape remains compatible with existing ZIP Explorer components.
- If proxy setup is missing or Census errors, source status reports a Census error while optional providers still load independently.
