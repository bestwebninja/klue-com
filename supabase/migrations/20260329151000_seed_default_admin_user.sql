-- Seed a default enterprise admin account in core.users
-- Password is stored as a bcrypt hash via pgcrypto/crypt.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_tenant_id UUID;
  v_password_hash TEXT;
BEGIN
  -- Ensure a default enterprise tenant exists.
  SELECT id
  INTO v_tenant_id
  FROM core.tenants
  WHERE slug = 'kluje-default'
    AND deleted_at IS NULL
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    INSERT INTO core.tenants (name, slug, status, plan_tier)
    VALUES ('Kluje Default Tenant', 'kluje-default', 'active', 'enterprise')
    RETURNING id INTO v_tenant_id;
  END IF;

  -- Secure bcrypt hash for the provided bootstrap password.
  v_password_hash := crypt('adM*in123', gen_salt('bf', 12));

  -- Create or rotate the default admin login in core.users.
  UPDATE core.users
  SET password_hash = v_password_hash,
      status = 'active',
      deleted_at = NULL,
      updated_at = NOW()
  WHERE tenant_id = v_tenant_id
    AND email = 'marcus@kluje.com';

  IF NOT FOUND THEN
    INSERT INTO core.users (
      tenant_id,
      email,
      password_hash,
      status,
      mfa_enabled
    )
    VALUES (
      v_tenant_id,
      'marcus@kluje.com',
      v_password_hash,
      'active',
      FALSE
    );
  END IF;
END
$$;
