-- Revoke SELECT from anon on job_listings base table
-- Anonymous users should only access the sanitized public_job_listings view
REVOKE SELECT ON public.job_listings FROM anon;

-- Ensure the sanitized public view is accessible to anon
GRANT SELECT ON public.public_job_listings TO anon, authenticated;