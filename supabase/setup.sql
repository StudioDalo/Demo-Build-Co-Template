-- Paste this whole file into Supabase → SQL Editor → Run. Safe to run more than once.

-- Trade site template: leads table + private uploads bucket.
-- Run in Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  type          text not null check (type in ('quick', 'quote', 'checklist')),
  complete      boolean not null default false,
  status        text not null default 'new' check (status in ('new', 'contacted', 'survey_booked', 'won', 'lost')),
  score         text check (score in ('hot', 'warm', 'cold')),
  score_points  integer,
  name          text not null default '',
  phone         text not null default '',
  email         text,
  postcode      text,
  services      text[] not null default '{}',
  answers       jsonb not null default '{}'::jsonb,
  uploads       jsonb not null default '[]'::jsonb,
  notes         jsonb not null default '[]'::jsonb,
  source        jsonb not null default '{}'::jsonb,
  consent       boolean not null default false,
  token_hash    text not null default ''
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- Only the server (service role key) reads or writes leads. No public access at all.
alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;

-- Private bucket for customer photos/plans (served to the admin via signed URLs).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lead-uploads', 'lead-uploads', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'])
on conflict (id) do nothing;

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

-- New Supabase projects ship an auto-enable-RLS event trigger function in public.
-- Only the event trigger needs it, so remove API execute access (clears the security advisor warning).
-- Guarded so this is a no-op on projects that don't have the function.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
  end if;
end $$;

