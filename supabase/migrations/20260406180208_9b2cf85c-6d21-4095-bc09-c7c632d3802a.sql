SELECT au.id AS user_id, au.email, au.email_confirmed_at, ur.role
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
WHERE lower(au.email) = 'marcus@kluje.com';