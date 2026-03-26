-- Update handle_new_user to also assign provider role based on user_type metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_full_name TEXT;
  v_email TEXT;
  v_user_type TEXT;
BEGIN
  v_email := TRIM(COALESCE(NEW.email, ''));
  IF LENGTH(v_email) > 255 THEN
    v_email := LEFT(v_email, 255);
  END IF;
  
  v_full_name := TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  IF LENGTH(v_full_name) > 100 THEN
    v_full_name := LEFT(v_full_name, 100);
  END IF;
  v_full_name := regexp_replace(v_full_name, E'[\\x00-\\x1F\\x7F]', '', 'g');
  IF v_full_name = '' THEN
    v_full_name := NULL;
  END IF;
  
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, v_email, v_full_name);
  
  -- Auto-assign provider role if user_type is 'provider'
  v_user_type := TRIM(COALESCE(NEW.raw_user_meta_data ->> 'user_type', ''));
  IF v_user_type = 'provider' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'provider')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;