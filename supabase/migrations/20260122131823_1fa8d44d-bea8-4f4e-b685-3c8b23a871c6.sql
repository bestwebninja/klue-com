-- Create portfolio_images table for provider work showcase
CREATE TABLE public.portfolio_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category_id UUID REFERENCES public.service_categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  display_order INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_images
CREATE POLICY "Anyone can view portfolio images" 
ON public.portfolio_images 
FOR SELECT 
USING (true);

CREATE POLICY "Providers can insert own portfolio images" 
ON public.portfolio_images 
FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own portfolio images" 
ON public.portfolio_images 
FOR UPDATE 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own portfolio images" 
ON public.portfolio_images 
FOR DELETE 
USING (auth.uid() = provider_id);

-- Create verification_requests table
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  business_registration_number TEXT,
  insurance_document_url TEXT,
  id_document_url TEXT,
  qualifications TEXT,
  years_experience INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verification_requests
CREATE POLICY "Providers can view own verification" 
ON public.verification_requests 
FOR SELECT 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can insert own verification" 
ON public.verification_requests 
FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own pending verification" 
ON public.verification_requests 
FOR UPDATE 
USING (auth.uid() = provider_id AND status = 'pending');

CREATE POLICY "Admins can view all verifications" 
ON public.verification_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update verifications" 
ON public.verification_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Create provider_blog_posts table
CREATE TABLE public.provider_blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  category_id UUID REFERENCES public.service_categories(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, slug)
);

-- Enable RLS
ALTER TABLE public.provider_blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_blog_posts
CREATE POLICY "Anyone can view published blog posts" 
ON public.provider_blog_posts 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Providers can view own posts" 
ON public.provider_blog_posts 
FOR SELECT 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can insert own posts" 
ON public.provider_blog_posts 
FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own posts" 
ON public.provider_blog_posts 
FOR UPDATE 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own posts" 
ON public.provider_blog_posts 
FOR DELETE 
USING (auth.uid() = provider_id);

CREATE POLICY "Admins can view all posts" 
ON public.provider_blog_posts 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all posts" 
ON public.provider_blog_posts 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for verification documents (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verifications', 'verifications', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio bucket
CREATE POLICY "Anyone can view portfolio images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Providers can upload portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Providers can update own portfolio images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Providers can delete own portfolio images"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for verifications bucket (private)
CREATE POLICY "Providers can upload verification docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Providers can view own verification docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all verification docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'verifications' AND has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on new tables
CREATE TRIGGER update_portfolio_images_updated_at
  BEFORE UPDATE ON public.portfolio_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_blog_posts_updated_at
  BEFORE UPDATE ON public.provider_blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();