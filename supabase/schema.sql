-- Andanza schema: collections, places, itineraries
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  name text not null,
  description text,
  lat double precision,
  lng double precision,
  location_status text not null default 'inferred' check (location_status in ('confirmed', 'inferred')),
  source_reel_url text,
  raw_caption text,
  raw_transcript text,
  user_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists itineraries (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  days_requested int not null,
  plan_json jsonb not null,
  generated_at timestamptz not null default now()
);

alter table collections enable row level security;
alter table places enable row level security;
alter table itineraries enable row level security;

create policy "authenticated full access" on collections
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on places
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on itineraries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
