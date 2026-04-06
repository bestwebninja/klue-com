-- =============================================================================
-- SECURITY HARDENING MIGRATION
-- Fixes: PII exposure, self-assign role, review field overwrite, OTP plaintext,
--        missing RLS policies, extension schema, function search path.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES: drop the original USING (true) policy that exposes all PII
--    (the safer "Users can only view own profile directly" was added later in
--     20260111083420 but the original permissive policy was never dropped)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- ---------------------------------------------------------------------------
-- 2. USER_ROLES: remove self-service provider role assignment
--    (any authenticated user could call supabase.from('user_roles').insert(...)
--     with role='provider' and it would succeed)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own provider role during signup" ON public.user_roles;

-- Replace with a SECURITY DEFINER function so the application goes through a
-- controlled path instead of directly writing to user_roles.
CREATE OR REPLACE FUNCTION public.assign_provider_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Prevent admins/moderators from accidentally downgrading themselves
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Cannot assign provider role to admin or moderator users';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'provider'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_provider_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_provider_role() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. REVIEWS: restrict providers to only updating their response fields
--    (the existing UPDATE policy let providers modify rating, title, content)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_provider_response_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only apply restriction when the updater is the provider (not the reviewer)
  IF OLD.provider_id IS NOT DISTINCT FROM auth.uid()
     AND OLD.reviewer_id IS DISTINCT FROM auth.uid() THEN
    -- Provider is updating their own review — only allow response fields
    IF NEW.rating        IS DISTINCT FROM OLD.rating        OR
       NEW.title         IS DISTINCT FROM OLD.title         OR
       NEW.content       IS DISTINCT FROM OLD.content       OR
       NEW.reviewer_id   IS DISTINCT FROM OLD.reviewer_id   OR
       NEW.provider_id   IS DISTINCT FROM OLD.provider_id   OR
       NEW.job_listing_id IS DISTINCT FROM OLD.job_listing_id THEN
      RAISE EXCEPTION 'Providers may only update provider_response and provider_response_at';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_provider_response_fields ON public.reviews;
CREATE TRIGGER enforce_provider_response_fields
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_provider_response_only();

-- ---------------------------------------------------------------------------
-- 4. PHONE VERIFICATIONS: replace plaintext OTP with SHA-256 hash
--    Edge functions (send-sms-verification, verify-sms-code) are updated
--    in the same commit to write/compare code_hash instead of code.
-- ---------------------------------------------------------------------------
ALTER TABLE public.phone_verifications
  ADD COLUMN IF NOT EXISTS code_hash TEXT;

-- Migrate any existing plaintext codes to hashes using pgcrypto
UPDATE public.phone_verifications
SET code_hash = encode(digest(code, 'sha256'), 'hex')
WHERE code IS NOT NULL AND code_hash IS NULL;

-- Make code_hash required, drop the plaintext column
ALTER TABLE public.phone_verifications
  ALTER COLUMN code_hash SET NOT NULL;

ALTER TABLE public.phone_verifications
  DROP COLUMN IF EXISTS code;

-- ---------------------------------------------------------------------------
-- 5. EXTENSIONS: ensure pgcrypto and citext live in the extensions schema
--    (previous migrations created them without specifying a schema, which
--     defaults to public — Supabase recommends the extensions schema)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    CREATE EXTENSION pgcrypto WITH SCHEMA extensions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'citext') THEN
    CREATE EXTENSION citext WITH SCHEMA extensions;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 6. RLS: enable and add policies for tables that were missing them
-- ---------------------------------------------------------------------------

-- 6a. dashboard_templates — admin-seeded config; everyone can read, admins write
ALTER TABLE public.dashboard_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dashboard templates"
  ON public.dashboard_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage dashboard templates"
  ON public.dashboard_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6b. ai_agents — admin-seeded config; everyone can read, admins write
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ai agents"
  ON public.ai_agents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage ai agents"
  ON public.ai_agents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6c. document_entities — scoped through parent document → business unit
ALTER TABLE public.document_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business unit members can access document entities"
  ON public.document_entities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_id
        AND public.is_business_unit_member(d.business_unit_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_id
        AND public.is_business_unit_member(d.business_unit_id)
    )
  );

-- 6d. phone_verifications already has RLS enabled with default-deny (intentional —
--     the table is only accessed via service-role edge functions). No policies needed.

-- ---------------------------------------------------------------------------
-- 7. get_provider_contact_details: the version in 20260115061150 loosened the
--    restriction to any authenticated user. Restore the quote-relationship check.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_provider_contact_details(provider_uuid uuid)
RETURNS TABLE(id uuid, email text, phone text, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Return contact details only for the provider themselves, or for a user
  -- who has an accepted/completed quote relationship with the provider.
  IF auth.uid() = provider_uuid OR EXISTS (
    SELECT 1
    FROM public.quote_requests qr
    JOIN public.job_listings jl ON jl.id = qr.job_listing_id
    WHERE qr.provider_id = provider_uuid
      AND jl.posted_by = auth.uid()
      AND qr.status IN ('accepted', 'completed')
  ) THEN
    RETURN QUERY
    SELECT p.id, p.email, p.phone, p.full_name
    FROM public.profiles p
    WHERE p.id = provider_uuid;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.get_provider_contact_details(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_provider_contact_details(uuid) TO authenticated;
