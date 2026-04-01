# Census ZIP Proxy Setup (Supabase Edge Function)

This project uses a Supabase Edge Function (`census-zip-profile`) as a secure proxy for the U.S. Census API.
The Census API key stays server-side in Supabase secrets and is never exposed to browser code.

## 1) Frontend environment variables

Set these in your local `.env` (or equivalent):

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 2) Set the Supabase secret (server-side only)

From the repo root:

```bash
supabase secrets set CENSUS_API_KEY=YOUR_KEY
```

> Do **not** add `CENSUS_API_KEY` to browser/Vite environment variables.

## 3) Serve functions locally

```bash
supabase start
supabase functions serve census-zip-profile --env-file .env
```

## 4) Deploy the function

```bash
supabase functions deploy census-zip-profile
```

If needed, set/re-set the production secret:

```bash
supabase secrets set CENSUS_API_KEY=YOUR_KEY
```

## 5) Frontend invocation path

The browser calls Supabase Functions via `supabase.functions.invoke("census-zip-profile", { body: { zip } })`.

The function then calls Census server-side using:

`https://api.census.gov/data/2024/acs/acs5/profile?...&key={CENSUS_API_KEY}`

## 6) Why this is secure

- Browser only receives Supabase anon credentials.
- Census API key is stored as an Edge Function secret (`Deno.env.get("CENSUS_API_KEY")`).
- Key is never shipped in client bundles or network requests from the browser.
