-- ============================================================
-- Admin users, signup restrictions, newsletter subscriptions
-- ============================================================

-- 1. Grant admin role to divitiae.terrae.llc@gmail.com if they already exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'divitiae.terrae.llc@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Trigger: auto-grant admin to specific emails on signup
CREATE OR REPLACE FUNCTION public.auto_admin_specific_emails()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.email IN ('marcus@kluje.com', 'divitiae.terrae.llc@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_admin_on_signup ON auth.users;
CREATE TRIGGER auto_admin_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_admin_specific_emails();

-- 3. Site settings table (key-value store for admin-controlled flags)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.site_settings (key, value, description)
VALUES
  ('signups_restricted', 'true'::jsonb,
   'When true, new user signups are temporarily blocked'),
  ('signup_notification_email', '"marcus@kluje.com"'::jsonb,
   'Email address to notify when a signup attempt occurs during restriction'),
  ('site_maintenance', 'false'::jsonb,
   'When true, shows a maintenance message to non-admin visitors')
ON CONFLICT (key) DO NOTHING;

-- 4. Signup attempts log (captured even when signups are blocked)
CREATE TABLE IF NOT EXISTS public.signup_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  user_type    TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  notified     BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view signup attempts"
  ON public.signup_attempts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert signup attempts"
  ON public.signup_attempts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 5. Newsletter subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email              TEXT UNIQUE NOT NULL,
  name               TEXT,
  consent_marketing  BOOLEAN NOT NULL DEFAULT FALSE,
  subscribed_at      TIMESTAMPTZ DEFAULT NOW(),
  is_active          BOOLEAN DEFAULT TRUE,
  source             TEXT DEFAULT 'newsletter_page',
  unsubscribed_at    TIMESTAMPTZ
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage newsletter subscribers"
  ON public.newsletter_subscribers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
