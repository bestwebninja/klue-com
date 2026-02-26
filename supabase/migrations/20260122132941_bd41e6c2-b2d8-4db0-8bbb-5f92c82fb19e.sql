-- Add job lead max distance column to notification_preferences
ALTER TABLE public.notification_preferences
ADD COLUMN job_lead_max_distance integer NOT NULL DEFAULT 50;

-- Add comment for documentation
COMMENT ON COLUMN public.notification_preferences.job_lead_max_distance IS 'Maximum distance in miles for receiving job lead notifications';