-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Users can view their own posts
CREATE POLICY "Users can view their own blog posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (author_id = auth.uid());

-- Users can create their own posts
CREATE POLICY "Users can create their own blog posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

-- Users can update their own posts (only drafts and rejected)
CREATE POLICY "Users can update their own draft posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (author_id = auth.uid() AND status IN ('draft', 'rejected'))
WITH CHECK (author_id = auth.uid());

-- Users can delete their own draft posts
CREATE POLICY "Users can delete their own draft posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (author_id = auth.uid() AND status = 'draft');

-- Admins can view all posts
CREATE POLICY "Admins can view all blog posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all posts
CREATE POLICY "Admins can update all blog posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any posts
CREATE POLICY "Admins can delete any blog posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Public can view published posts
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Add trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();