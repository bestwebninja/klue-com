-- Lock down direct INSERT into public.user_roles and route role grants
-- through trusted server-side functions only.

-- 1) Remove vulnerable/self-service provider insert policy explicitly.
DROP POLICY IF EXISTS "Users can insert own provider role during signup" ON public.user_roles;

-- 2) Ensure authenticated users cannot directly INSERT into user_roles by
--    dropping every INSERT policy on this table (idempotent).
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', p.policyname);
  END LOOP;
END
$$;

-- 3) Keep a least-privilege SELECT policy so users can read only their own roles.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Users can view own roles'
      AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "Users can view own roles"
      ON public.user_roles
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- 4) Trusted role assignment function.
--    Callable only by service_role. No anon/authenticated execute grant.
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id uuid,
  target_role public.app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id is required';
  END IF;

  IF target_role IS NULL THEN
    RAISE EXCEPTION 'target_role is required';
  END IF;

  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Only service role may assign application roles';
  END IF;

  -- Never allow provider role to be combined with privileged operator roles.
  IF target_role = 'provider'::public.app_role AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = target_user_id
      AND ur.role IN ('admin'::public.app_role, 'moderator'::public.app_role)
  ) THEN
    RAISE EXCEPTION 'Cannot assign provider role to admin or moderator users';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, target_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_user_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assign_user_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.assign_user_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, public.app_role) TO service_role;

-- Keep provider-specific helper but force it through assign_user_role and
-- lock it to service_role execution only.
CREATE OR REPLACE FUNCTION public.assign_provider_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.assign_user_role(target_user_id, 'provider'::public.app_role);
END;
$$;

REVOKE ALL ON FUNCTION public.assign_provider_role(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assign_provider_role(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.assign_provider_role(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.assign_provider_role(uuid) TO service_role;

-- 5) Add unique constraint on (user_id, role) if missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'user_roles'
      AND c.conname = 'user_roles_user_id_role_key'
      AND c.contype = 'u'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END
$$;

-- 6) Add explicit role-value CHECK if missing (enum already enforces this,
--    but this constraint documents and defends approved values explicitly).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'user_roles'
      AND c.conname = 'user_roles_role_approved_check'
      AND c.contype = 'c'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_role_approved_check
      CHECK (role::text = ANY (ARRAY['admin','moderator','user','provider']));
  END IF;
END
$$;
