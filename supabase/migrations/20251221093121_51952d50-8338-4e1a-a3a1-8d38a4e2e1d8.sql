-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('free', 'active', 'cancelled', 'expired');

-- Create profiles table for service providers
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  subscription_status subscription_status NOT NULL DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create predefined service categories
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view service categories" ON public.service_categories FOR SELECT USING (true);

-- Insert predefined categories
INSERT INTO public.service_categories (name, icon) VALUES
  ('Plumbing', 'wrench'),
  ('Electrical', 'zap'),
  ('Roofing', 'home'),
  ('Painting', 'paintbrush'),
  ('Landscaping', 'trees'),
  ('HVAC', 'thermometer'),
  ('Carpentry', 'hammer'),
  ('Flooring', 'square'),
  ('Cleaning', 'sparkles'),
  ('General Contractor', 'hard-hat');

-- Create services table (provider's offered services)
CREATE TABLE public.provider_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  custom_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view provider services" ON public.provider_services FOR SELECT USING (true);
CREATE POLICY "Providers can insert own services" ON public.provider_services FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own services" ON public.provider_services FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Providers can delete own services" ON public.provider_services FOR DELETE USING (auth.uid() = provider_id);

-- Create locations table
CREATE TABLE public.provider_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT,
  postcode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view provider locations" ON public.provider_locations FOR SELECT USING (true);
CREATE POLICY "Providers can insert own locations" ON public.provider_locations FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own locations" ON public.provider_locations FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Providers can delete own locations" ON public.provider_locations FOR DELETE USING (auth.uid() = provider_id);

-- Create job listings (posted by homeowners)
CREATE TABLE public.job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.service_categories(id),
  location TEXT,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'open',
  posted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open job listings" ON public.job_listings FOR SELECT USING (status = 'open' OR auth.uid() = posted_by);
CREATE POLICY "Users can insert job listings" ON public.job_listings FOR INSERT WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "Users can update own job listings" ON public.job_listings FOR UPDATE USING (auth.uid() = posted_by);

-- Create quote requests table
CREATE TABLE public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_listing_id UUID REFERENCES public.job_listings(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view own quote requests" ON public.quote_requests FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Job posters can view quote requests for their jobs" ON public.quote_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_listings WHERE id = job_listing_id AND posted_by = auth.uid())
);
CREATE POLICY "Subscribed providers can insert quote requests" ON public.quote_requests FOR INSERT WITH CHECK (
  auth.uid() = provider_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND subscription_status = 'active')
);
CREATE POLICY "Providers can update own quote requests" ON public.quote_requests FOR UPDATE USING (auth.uid() = provider_id);

-- Create trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_listings_updated_at BEFORE UPDATE ON public.job_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();