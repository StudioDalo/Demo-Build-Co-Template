-- New Supabase projects ship an auto-enable-RLS event trigger function in public.
-- Only the event trigger needs it, so remove API execute access (clears the security advisor warning).
-- Guarded so this is a no-op on projects that don't have the function.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
  end if;
end $$;
