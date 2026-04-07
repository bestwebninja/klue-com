-- =============================================================================
-- FIX: email_notifications leaks resend_id and internal fields to recipients
--
-- Current state: "Users can view own email notifications" policy lets
-- recipients do SELECT * and get resend_id (3rd-party message ID),
-- related_entity_id, related_entity_type, error_message, and recipient_id —
-- all internal infrastructure fields with no user-facing purpose.
--
-- Fix:
--   1. Drop the direct-table SELECT policy for authenticated users.
--   2. Create user_email_notifications view that:
--        - Filters to the calling user via auth.uid() = recipient_id in WHERE
--        - Exposes only the 5 fields the UI actually needs
--        - Masks error_message to a generic boolean (delivery_failed)
--   3. Grant SELECT on the view to authenticated.
--   4. Service role retains full table access (edge functions, admin).
-- =============================================================================

-- 1. Drop the permissive table-level SELECT policy
DROP POLICY IF EXISTS "Users can view own email notifications" ON public.email_notifications;

-- 2. Create restricted user-facing view
--    security_invoker = off (default) so the view runs as its owner and we
--    apply the user filter explicitly in the WHERE clause instead of relying
--    on RLS, which lets us drop the table policy entirely.
CREATE OR REPLACE VIEW public.user_email_notifications
  WITH (security_invoker = off)
  AS
SELECT
  id,
  email_type,
  subject,
  status,
  sent_at,
  -- Never expose: resend_id, related_entity_id, related_entity_type,
  --               error_message, recipient_id, recipient_email
  (error_message IS NOT NULL) AS delivery_failed
FROM public.email_notifications
WHERE recipient_id = auth.uid();

-- 3. Grant to authenticated only (anon users have no notifications)
GRANT SELECT ON public.user_email_notifications TO authenticated;
