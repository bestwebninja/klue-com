

## Problem

The preview and published site show a blank/white page. The root `package.json` is configured as a monorepo workspace root with **no dependencies** listed. Lovable's dev server and build system run from the project root and expect dependencies (react, vite, tailwind, etc.) to be declared there. Since they're missing, nothing loads.

The `apps/web` and `apps/api` directories contain a separate enterprise advertiser dashboard -- these are independent from the main Kluje platform app (which lives in `src/`, `index.html`, `vite.config.ts` at the root).

## Plan

### Step 1: Fix root package.json

Remove the `workspaces` field and add all required dependencies and scripts so Lovable can build and serve the main app. This means:

- Add `"type": "module"` and proper `"dev"` / `"build"` scripts
- Add all dependencies the root app actually uses (react, react-dom, react-router-dom, @tanstack/react-query, @supabase/supabase-js, date-fns, lucide-react, tailwindcss, vite, shadcn/ui packages, etc.)
- Remove `"workspaces"` -- the `apps/` code can remain in the repo but shouldn't interfere with the root build

I will scan imports across `src/` to compile the full dependency list, then write the corrected `package.json`.

### Step 2: Verify lockfile compatibility

Remove `bun.lock` and `bun.lockb` if they conflict with npm/Lovable's package manager, so a clean install occurs.

### What stays the same

- All source code in `src/`, `index.html`, `vite.config.ts`, `supabase/` -- untouched
- The `apps/` directory files remain but are no longer referenced by workspace config

### Technical details

The root `package.json` currently:
```json
{
  "workspaces": ["apps/*", "packages/*"],
  "scripts": { "dev:web": "...", "build": "..." }
  // NO dependencies or devDependencies
}
```

This will be replaced with a standard single-app package.json containing all dependencies imported by the `src/` codebase, with standard `"dev": "vite"` and `"build": "vite build"` scripts that Lovable expects.

