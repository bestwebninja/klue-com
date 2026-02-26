-- Add provider response columns to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS provider_response TEXT,
ADD COLUMN IF NOT EXISTS provider_response_at TIMESTAMP WITH TIME ZONE;

-- Create policy for providers to update their own reviews (for responding)
CREATE POLICY "Providers can respond to their reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = provider_id)
WITH CHECK (auth.uid() = provider_id);