-- operational cleanup for legacy unsubscribe tokens; backend privileged roles bypass rls,
-- so this function provides an explicit cleanup entrypoint without adding end-user delete access.
create or replace function public.cleanup_email_unsubscribe_tokens()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted_count integer := 0;
begin
  if to_regclass('public.email_unsubscribe_tokens') is null then
    return 0;
  end if;

  delete from public.email_unsubscribe_tokens
  where used_at is not null
     or created_at < now() - interval '30 days';

  get diagnostics v_deleted_count = row_count;
  return v_deleted_count;
end;
$$;

revoke all on function public.cleanup_email_unsubscribe_tokens() from public;
grant execute on function public.cleanup_email_unsubscribe_tokens() to service_role;

select public.cleanup_email_unsubscribe_tokens();
