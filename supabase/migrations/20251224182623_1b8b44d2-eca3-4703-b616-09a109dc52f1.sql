-- Add RLS policy to allow job posters to update quote status (accept/complete)
CREATE POLICY "Job posters can update quote status"
ON quote_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM job_listings
    WHERE job_listings.id = quote_requests.job_listing_id
    AND job_listings.posted_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM job_listings
    WHERE job_listings.id = quote_requests.job_listing_id
    AND job_listings.posted_by = auth.uid()
  )
);

-- Update RLS policy for reviews to only allow when quote is accepted or completed
DROP POLICY IF EXISTS "Users can create reviews for others" ON reviews;

CREATE POLICY "Users can create reviews for accepted quotes"
ON reviews
FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id 
  AND auth.uid() <> provider_id
  AND (
    -- Must have an accepted or completed quote with this provider for this job
    EXISTS (
      SELECT 1 FROM quote_requests qr
      JOIN job_listings jl ON jl.id = qr.job_listing_id
      WHERE qr.provider_id = reviews.provider_id
      AND jl.posted_by = auth.uid()
      AND qr.status IN ('accepted', 'completed')
      AND (reviews.job_listing_id IS NULL OR qr.job_listing_id = reviews.job_listing_id)
    )
  )
);