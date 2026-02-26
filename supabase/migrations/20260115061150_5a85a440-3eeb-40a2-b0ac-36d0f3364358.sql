-- First drop the existing function
DROP FUNCTION IF EXISTS public.get_provider_contact_details(uuid);

-- Recreate the function to allow all authenticated users to see provider contact details
CREATE FUNCTION public.get_provider_contact_details(provider_uuid uuid)
RETURNS TABLE(id uuid, email text, phone text, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only require authentication, allow any logged-in user to see provider contact details
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT p.id, p.email, p.phone, p.full_name
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.id
  WHERE p.id = provider_uuid
    AND ur.role = 'provider';
END;
$$;