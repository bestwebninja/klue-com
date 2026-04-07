-- Normalize existing profile_snapshot payloads to an explicit allowlisted shape
-- and ensure services_offered is always an array.

UPDATE public.dashboard_bootstraps
SET profile_snapshot = jsonb_build_object(
  'first_name', profile_snapshot->'first_name',
  'last_name', profile_snapshot->'last_name',
  'full_name', profile_snapshot->'full_name',
  'company_name', profile_snapshot->'company_name',
  'services_offered', coalesce(profile_snapshot->'services_offered', '[]'::jsonb),
  'zip_code', profile_snapshot->'zip_code',
  'city', profile_snapshot->'city',
  'state', profile_snapshot->'state',
  'county', profile_snapshot->'county',
  'latitude', profile_snapshot->'latitude',
  'longitude', profile_snapshot->'longitude',
  'service_type_label', profile_snapshot->'service_type_label',
  'service_type_key', profile_snapshot->'service_type_key',
  'dashboard_template_key', profile_snapshot->'dashboard_template_key'
)
WHERE profile_snapshot IS NOT NULL;
