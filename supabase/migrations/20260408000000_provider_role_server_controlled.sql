-- Enforce server/admin-controlled provider role grants.
-- This hardens the previous assign_provider_role() helper so authenticated
-- end users cannot self-promote by invoking RPC directly.

CREATE OR REPLACE FUNCTION public.assign_provider_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id is required';
  END IF;

  -- Only service role or admins can grant provider.
  IF auth.role() <> 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Insufficient privileges to assign provider role';
  END IF;

  -- Never grant provider to admin/moderator identities.
  IF EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = target_user_id
      AND ur.role IN ('admin'::public.app_role, 'moderator'::public.app_role)
  ) THEN
    RAISE EXCEPTION 'Cannot assign provider role to admin or moderator users';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'provider'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_provider_role(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_provider_role(uuid) TO service_role, authenticated;
