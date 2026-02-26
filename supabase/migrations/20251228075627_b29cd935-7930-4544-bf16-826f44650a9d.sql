-- Revoke all privileges from anon role on messages table
-- Messages are private communications between authenticated users only
REVOKE ALL ON public.messages FROM anon;

-- Ensure authenticated users retain their access (controlled by RLS)
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;