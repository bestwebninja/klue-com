DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Authenticated users can view provider profiles'
  ) THEN
    CREATE POLICY "Authenticated users can view provider profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
      auth.uid() = id
      OR public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = profiles.id
          AND ur.role = 'provider'
      )
    );
  END IF;
END $$;