-- service role only: allow operational cleanup of used/expired unsubscribe tokens

drop policy if exists "service role can delete unsubscribe tokens"
on public.email_unsubscribe_tokens;

create policy "service role can delete unsubscribe tokens"
on public.email_unsubscribe_tokens
for delete
to service_role
using (true);
