-- 1. Remove the overly permissive profiles SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- 2. Fix search_path on email queue functions (correct arg order)
ALTER FUNCTION public.enqueue_email(queue_name text, payload jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer) SET search_path = public;
ALTER FUNCTION public.delete_email(queue_name text, message_id bigint) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb) SET search_path = public;