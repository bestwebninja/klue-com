-- Backfill admin roles for canonical owner allowlist accounts.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users AS u
WHERE lower(u.email) IN (
  'divitiae.terrae.llc@gmail.com',
  'marcus@kluje.com',
  'marcusmommsen@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
