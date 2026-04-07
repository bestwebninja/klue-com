-- Security hardening: enforce an allowlisted dashboard_bootstraps.profile_snapshot
-- and strip sensitive keys from historical rows.

CREATE OR REPLACE FUNCTION public.sanitize_dashboard_profile_snapshot(input_snapshot jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    (
      SELECT jsonb_object_agg(kv.key, kv.value)
      FROM jsonb_each(COALESCE(input_snapshot, '{}'::jsonb)) AS kv
      WHERE kv.key = ANY (
        ARRAY[
          'first_name',
          'last_name',
          'full_name',
          'company_name',
          'services_offered',
          'zip_code',
          'city',
          'state',
          'county',
          'latitude',
          'longitude',
          'lat',
          'lng',
          'service_type_label',
          'service_type_key',
          'dashboard_template_key'
        ]
      )
    ),
    '{}'::jsonb
  );
$$;

CREATE OR REPLACE FUNCTION public.jsonb_contains_forbidden_profile_snapshot_keys(payload jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  WITH RECURSIVE walk(node) AS (
    SELECT COALESCE(payload, '{}'::jsonb)
    UNION ALL
    SELECT child.value
    FROM walk
    CROSS JOIN LATERAL jsonb_each(walk.node) AS child
    WHERE jsonb_typeof(walk.node) = 'object'
    UNION ALL
    SELECT item.value
    FROM walk
    CROSS JOIN LATERAL jsonb_array_elements(walk.node) AS item
    WHERE jsonb_typeof(walk.node) = 'array'
  ), flattened_keys AS (
    SELECT lower(obj.key) AS key_name
    FROM walk
    CROSS JOIN LATERAL jsonb_each(walk.node) AS obj
    WHERE jsonb_typeof(walk.node) = 'object'
  )
  SELECT EXISTS (
    SELECT 1
    FROM flattened_keys
    WHERE
      key_name = ANY (
        ARRAY[
          'email',
          'phone',
          'phone_number',
          'mobile',
          'mobile_number',
          'subscription_status',
          'subscription',
          'subscription_expires_at',
          'stripe_customer_id',
          'stripe_customer',
          'stripe_id',
          'customer_id',
          'customer_identifier',
          'billing_email',
          'billing_address',
          'payment_method',
          'payment_last4'
        ]
      )
      OR key_name LIKE 'stripe%'
      OR key_name LIKE '%stripe%'
      OR key_name LIKE 'customer%'
      OR key_name LIKE '%customer%'
      OR key_name LIKE 'billing%'
      OR key_name LIKE '%billing%'
      OR key_name LIKE 'payment%'
      OR key_name LIKE '%payment%'
  );
$$;

CREATE OR REPLACE FUNCTION public.enforce_dashboard_profile_snapshot_allowlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.profile_snapshot := public.sanitize_dashboard_profile_snapshot(NEW.profile_snapshot);

  IF public.jsonb_contains_forbidden_profile_snapshot_keys(NEW.profile_snapshot) THEN
    RAISE EXCEPTION 'dashboard_bootstraps.profile_snapshot contains forbidden keys';
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill cleanup: remove all non-allowlisted keys from historical snapshots.
UPDATE public.dashboard_bootstraps
SET profile_snapshot = public.sanitize_dashboard_profile_snapshot(profile_snapshot)
WHERE profile_snapshot IS DISTINCT FROM public.sanitize_dashboard_profile_snapshot(profile_snapshot);

ALTER TABLE public.dashboard_bootstraps
  ALTER COLUMN profile_snapshot SET DEFAULT '{}'::jsonb,
  ALTER COLUMN profile_snapshot SET NOT NULL;

ALTER TABLE public.dashboard_bootstraps
  DROP CONSTRAINT IF EXISTS dashboard_bootstraps_profile_snapshot_allowlist_check;

ALTER TABLE public.dashboard_bootstraps
  ADD CONSTRAINT dashboard_bootstraps_profile_snapshot_allowlist_check
  CHECK (
    profile_snapshot = public.sanitize_dashboard_profile_snapshot(profile_snapshot)
    AND NOT public.jsonb_contains_forbidden_profile_snapshot_keys(profile_snapshot)
  );

DROP TRIGGER IF EXISTS enforce_dashboard_profile_snapshot_allowlist
  ON public.dashboard_bootstraps;

CREATE TRIGGER enforce_dashboard_profile_snapshot_allowlist
BEFORE INSERT OR UPDATE ON public.dashboard_bootstraps
FOR EACH ROW
EXECUTE FUNCTION public.enforce_dashboard_profile_snapshot_allowlist();

-- Regression checks for sanitizer/forbidden-key detection.
DO $$
DECLARE
  cleaned jsonb;
BEGIN
  cleaned := public.sanitize_dashboard_profile_snapshot(
    jsonb_build_object(
      'first_name', 'Alex',
      'zip_code', '90210',
      'email', 'secret@example.com',
      'billing_address', jsonb_build_object('line1', '123 Main St'),
      'stripe_customer_id', 'cus_123'
    )
  );

  IF cleaned ? 'email' OR cleaned ? 'billing_address' OR cleaned ? 'stripe_customer_id' THEN
    RAISE EXCEPTION 'Regression failure: sanitizer retained forbidden keys';
  END IF;

  IF NOT (cleaned ? 'first_name' AND cleaned ? 'zip_code') THEN
    RAISE EXCEPTION 'Regression failure: sanitizer dropped allowlisted keys';
  END IF;

  IF public.jsonb_contains_forbidden_profile_snapshot_keys(
    '{"safe": {"company_name": "Acme Builders"}}'::jsonb
  ) THEN
    RAISE EXCEPTION 'Regression failure: safe payload was flagged as forbidden';
  END IF;

  IF NOT public.jsonb_contains_forbidden_profile_snapshot_keys(
    '{"safe": {"nested": {"stripeCustomerId": "cus_abc"}}}'::jsonb
  ) THEN
    RAISE EXCEPTION 'Regression failure: nested forbidden keys were not detected';
  END IF;
END;
$$;
