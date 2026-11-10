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
