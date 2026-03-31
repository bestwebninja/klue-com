# Role-Based Onboarding Migration Notes

## Scope
This migration introduces normalized onboarding data capture, zip-code intelligence caching, and template-driven dashboards.

## Database changes
Run migration:

```bash
supabase db push
```

Applied migration file:
- `supabase/migrations/20260331110000_role_based_onboarding.sql`

### Added profile fields
- `first_name`, `last_name`, `company_name`
- `services_offered` (text array)
- `zip_code`, `city`, `state`, `county`
- `latitude`, `longitude`

### Added tables
- `dashboard_bootstraps`: role key + template + widget config + intelligence snapshot
- `zip_code_intelligence_cache`: normalized per-ZIP intelligence payload with refresh timestamps

### Trigger update
`public.handle_new_user` now hydrates the expanded profile from `raw_user_meta_data`.

## Runtime behavior updates
- Signup captures first/last name, company, services, zip code autocomplete.
- Signup writes normalized onboarding data to profile and dashboard bootstrap.
- ZIP intelligence is fetched through `/api/v1/onboarding/zip-intelligence/:zipCode` and cached.
- Dashboard home is now template-registry driven via composable widgets.

## Backward compatibility
- Existing auth/session behavior is unchanged.
- Existing dashboard tabs remain; only home view now uses role template composition.
