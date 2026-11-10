-- Trade site template: won-job value + ad attribution (for Google Ads offline conversions).
-- All new columns are nullable so existing rows are unaffected.

alter table public.leads
  add column if not exists won_value      numeric(12, 2) check (won_value is null or won_value >= 0),
  add column if not exists won_at         timestamptz,
  add column if not exists gclid          text,
  add column if not exists gbraid         text,
  add column if not exists wbraid         text,
  add column if not exists utm_source     text,
  add column if not exists utm_medium     text,
  add column if not exists utm_campaign   text,
  add column if not exists utm_term       text,
  add column if not exists utm_content    text,
  add column if not exists landing_page   text,
  add column if not exists referrer       text,
  add column if not exists first_seen_at  timestamptz;

-- Dashboard filters and the offline-conversion export
create index if not exists leads_complete_idx on public.leads (complete);
create index if not exists leads_won_idx on public.leads (won_at) where status = 'won';
create index if not exists leads_gclid_idx on public.leads (gclid) where gclid is not null;

-- Keep updated_at honest even for edits made directly in the Supabase dashboard
create or replace function public.leads_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at before update on public.leads
  for each row execute function public.leads_touch_updated_at();

-- Security (re-asserted): RLS on, no policies, no grants to the public roles.
-- Only the server (service role key, never sent to the browser) can read or write leads.
alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;
revoke execute on function public.leads_touch_updated_at() from anon, authenticated, public;
