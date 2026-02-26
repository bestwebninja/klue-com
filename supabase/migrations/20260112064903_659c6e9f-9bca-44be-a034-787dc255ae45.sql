
-- Create a secure function to get provider contact details for users with quote relationships
CREATE OR REPLACE FUNCTION public.get_provider_contact_details(provider_uuid uuid)
RETURNS TABLE (
  id uuid,
  email text,
  phone text,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return contact details if user has a quote relationship with the provider
  -- or if the user is the provider themselves
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if user is the provider or has an accepted/completed quote relationship
  IF auth.uid() = provider_uuid OR EXISTS (
    SELECT 1
    FROM public.quote_requests qr
    JOIN public.job_listings jl ON jl.id = qr.job_listing_id
    WHERE qr.provider_id = provider_uuid
    AND jl.posted_by = auth.uid()
    AND qr.status IN ('accepted', 'completed')
  ) THEN
    RETURN QUERY
    SELECT p.id, p.email, p.phone, p.full_name
    FROM public.profiles p
    WHERE p.id = provider_uuid;
  END IF;
  
  RETURN;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_provider_contact_details(uuid) TO authenticated;
