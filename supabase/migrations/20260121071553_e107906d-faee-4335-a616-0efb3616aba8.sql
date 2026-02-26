-- Create table for email notification tracking
CREATE TABLE public.email_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  related_entity_id UUID,
  related_entity_type TEXT,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  resend_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_email_notifications_recipient ON public.email_notifications(recipient_id);
CREATE INDEX idx_email_notifications_entity ON public.email_notifications(related_entity_id, related_entity_type);
CREATE INDEX idx_email_notifications_sent_at ON public.email_notifications(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own email notifications
CREATE POLICY "Users can view own email notifications"
ON public.email_notifications
FOR SELECT
USING (auth.uid() = recipient_id);

-- Edge functions can insert email notifications (using service role key)
-- No INSERT policy needed as edge functions use service role