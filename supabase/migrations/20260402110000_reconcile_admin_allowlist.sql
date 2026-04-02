-- Reconcile admin allowlist across trigger/bootstrap paths.
-- Canonical allowlist (current product owners):
--   - divitiae.terrae.llc@gmail.com
--   - marcus@kluje.com

CREATE OR REPLACE FUNCTION public.auto_admin_specific_emails()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF lower(NEW.email) = ANY (ARRAY['divitiae.terrae.llc@gmail.com', 'marcus@kluje.com']) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Re-run-safe backfill for allowlisted owner accounts.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) IN ('divitiae.terrae.llc@gmail.com', 'marcus@kluje.com')
ON CONFLICT (user_id, role) DO NOTHING;
