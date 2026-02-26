-- Create a function to auto-close jobs when they reach 3 quotes
CREATE OR REPLACE FUNCTION public.auto_close_job_on_quote_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quote_count INTEGER;
BEGIN
  -- Count the number of quotes for this job
  SELECT COUNT(*) INTO quote_count
  FROM quote_requests
  WHERE job_listing_id = NEW.job_listing_id;

  -- If the job has reached 3 quotes, close it
  IF quote_count >= 3 THEN
    UPDATE job_listings
    SET status = 'closed'
    WHERE id = NEW.job_listing_id
    AND status = 'open';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to run after each quote request is inserted
CREATE TRIGGER auto_close_job_after_quote
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_close_job_on_quote_limit();