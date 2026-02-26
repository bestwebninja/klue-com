-- Add is_suspended column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_suspended boolean NOT NULL DEFAULT false;

-- Add suspended_at timestamp to track when user was suspended
ALTER TABLE public.profiles 
ADD COLUMN suspended_at timestamp with time zone DEFAULT NULL;

-- Add suspension_reason to store why user was suspended
ALTER TABLE public.profiles 
ADD COLUMN suspension_reason text DEFAULT NULL;