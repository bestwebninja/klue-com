-- Add foreign key constraints with ON DELETE CASCADE to ensure all user data is removed when account is deleted

-- First, add FK constraint to profiles if it doesn't exist (linking to auth.users with cascade)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add cascade delete for user_roles (drop and recreate if exists)
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add cascade delete for notification_preferences
ALTER TABLE public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;
ALTER TABLE public.notification_preferences 
ADD CONSTRAINT notification_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add cascade delete for provider_locations
ALTER TABLE public.provider_locations DROP CONSTRAINT IF EXISTS provider_locations_provider_id_fkey;
ALTER TABLE public.provider_locations 
ADD CONSTRAINT provider_locations_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add cascade delete for provider_services
ALTER TABLE public.provider_services DROP CONSTRAINT IF EXISTS provider_services_provider_id_fkey;
ALTER TABLE public.provider_services 
ADD CONSTRAINT provider_services_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add cascade delete for job_listings (set posted_by to NULL when user is deleted)
ALTER TABLE public.job_listings DROP CONSTRAINT IF EXISTS job_listings_posted_by_fkey;
ALTER TABLE public.job_listings 
ADD CONSTRAINT job_listings_posted_by_fkey 
FOREIGN KEY (posted_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add cascade delete for quote_requests
ALTER TABLE public.quote_requests DROP CONSTRAINT IF EXISTS quote_requests_provider_id_fkey;
ALTER TABLE public.quote_requests 
ADD CONSTRAINT quote_requests_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add cascade delete for messages (sender)
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add cascade delete for messages (recipient)
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;
ALTER TABLE public.messages 
ADD CONSTRAINT messages_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add cascade delete for reviews (reviewer)
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add cascade delete for reviews (provider)
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_provider_id_fkey;
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add cascade delete for expert_questions
ALTER TABLE public.expert_questions DROP CONSTRAINT IF EXISTS expert_questions_user_id_fkey;
ALTER TABLE public.expert_questions 
ADD CONSTRAINT expert_questions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add cascade delete for expert_answers
ALTER TABLE public.expert_answers DROP CONSTRAINT IF EXISTS expert_answers_provider_id_fkey;
ALTER TABLE public.expert_answers 
ADD CONSTRAINT expert_answers_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES auth.users(id) ON DELETE CASCADE;