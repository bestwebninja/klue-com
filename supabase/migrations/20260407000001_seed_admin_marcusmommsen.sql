-- Provision admin account: marcusmommsen@gmail.com
-- ⚠ WARNING: This migration contains a bootstrap credential. Rotate the
--   password via Supabase dashboard → Authentication → Users after first login.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_uid UUID;
BEGIN
  -- Skip if the account already exists
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = 'marcusmommsen@gmail.com' LIMIT 1;

  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_uid,
      'authenticated',
      'authenticated',
      'marcusmommsen@gmail.com',
      crypt('CodA*Repo/2633', gen_salt('bf', 12)),
      now(),                              -- email pre-confirmed
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Marcus Mommsen"}'::jsonb,
      now(),
      now(),
      '', '', '', ''
    );

    -- handle_new_user trigger fires automatically and creates the profile.
    -- Explicitly grant admin role (trigger only covers the original two emails).
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

  ELSE
    -- Account exists — just ensure the admin role is present
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- Add to auto-admin trigger so the role is preserved on future auth events
CREATE OR REPLACE FUNCTION public.auto_admin_specific_emails()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF lower(NEW.email) = ANY (ARRAY[
    'divitiae.terrae.llc@gmail.com',
    'marcus@kluje.com',
    'marcusmommsen@gmail.com'
  ]) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
