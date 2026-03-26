-- Re-run-safe: ensure admin roles exist for the two owner accounts
-- This is safe to run multiple times due to ON CONFLICT DO NOTHING

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email IN ('divitiae.terrae.llc@gmail.com', 'marcus@kluje.com')
ON CONFLICT (user_id, role) DO NOTHING;
