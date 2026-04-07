SELECT au.id AS user_id, au.email, au.email_confirmed_at, array_remove(array_agg(ur.role), NULL) AS roles
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
WHERE lower(au.email) = 'marcus@kluje.com'
GROUP BY au.id, au.email, au.email_confirmed_at;