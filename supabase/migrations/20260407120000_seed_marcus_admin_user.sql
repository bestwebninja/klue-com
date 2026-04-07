-- Seed admin user marcus@kluje.com with a known password.
-- Safe to re-run: updates existing record, creates if missing.
-- The auto_admin_on_signup trigger and backfill in earlier migrations
-- assign the admin role in user_roles once the auth.users row exists.

DO $$
DECLARE
  v_email     TEXT    := 'marcus@kluje.com';
  v_password  TEXT    := 'JustLo0KInS3TuM';
  v_user_id   UUID;
BEGIN
  -- Look up existing user
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_email);

  IF v_user_id IS NOT NULL THEN
    -- User exists: reset password, confirm email, stamp admin metadata
    UPDATE auth.users
    SET
      encrypted_password  = crypt(v_password, gen_salt('bf', 10)),
      email_confirmed_at  = COALESCE(email_confirmed_at, now()),
      raw_app_meta_data   = raw_app_meta_data
                              || '{"role":"admin","provider":"email","providers":["email"]}'::jsonb,
      updated_at          = now()
    WHERE id = v_user_id;
  ELSE
    -- Create fresh user
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, aud, role, email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at, updated_at,
      is_super_admin
    ) VALUES (
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf', 10)),
      now(),
      '{"role":"admin","provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(), now(),
      false
    );

    -- Register the email identity so password login works
    INSERT INTO auth.identities (
      provider_id, user_id,
      identity_data,
      provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id::text,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email',
      now(), now(), now()
    )
    ON CONFLICT (provider_id, provider) DO NOTHING;
  END IF;

  -- Ensure admin role row exists in public.user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
