-- Add latitude and longitude columns to job_listings for caching geocoded locations
ALTER TABLE public.job_listings 
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;

-- Add index for geospatial queries
CREATE INDEX idx_job_listings_location ON public.job_listings (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;