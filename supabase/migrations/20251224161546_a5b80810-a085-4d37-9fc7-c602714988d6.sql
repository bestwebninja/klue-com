-- Fix the security definer view by setting it to use invoker security
ALTER VIEW public.public_provider_profiles SET (security_invoker = on);