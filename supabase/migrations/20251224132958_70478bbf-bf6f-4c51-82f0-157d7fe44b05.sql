-- Add featured and verified columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN featured_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster featured provider queries
CREATE INDEX idx_profiles_featured ON public.profiles (is_featured) WHERE is_featured = true;
CREATE INDEX idx_profiles_verified ON public.profiles (is_verified) WHERE is_verified = true;