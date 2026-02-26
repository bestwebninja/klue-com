-- Update handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_email TEXT;
BEGIN
  -- Extract and validate email (already validated by Supabase auth, but sanitize anyway)
  v_email := TRIM(COALESCE(NEW.email, ''));
  IF LENGTH(v_email) > 255 THEN
    v_email := LEFT(v_email, 255);
  END IF;
  
  -- Extract and validate full_name from user metadata
  v_full_name := TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  
  -- Limit length to reasonable bounds (100 characters)
  IF LENGTH(v_full_name) > 100 THEN
    v_full_name := LEFT(v_full_name, 100);
  END IF;
  
  -- Remove any control characters that could cause issues
  v_full_name := regexp_replace(v_full_name, E'[\\x00-\\x1F\\x7F]', '', 'g');
  
  -- Set to NULL if empty after sanitization
  IF v_full_name = '' THEN
    v_full_name := NULL;
  END IF;
  
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, v_email, v_full_name);
  
  RETURN NEW;
END;
$$;