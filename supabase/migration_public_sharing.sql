-- Lets a collection be marked public so anyone with the link can view it
-- (read-only) without an account, while everything else stays private.
-- Run this once in the Supabase SQL Editor.

alter table collections add column if not exists is_public boolean not null default false;

-- These are ADDITIVE select-only policies — they never grant insert/update/delete,
-- and they don't touch the existing "owner full access" policies at all.
-- Postgres RLS OR's multiple permissive policies together for the same command,
-- so a row becomes visible if it satisfies EITHER the owner policy OR this one.

create policy "public read for shared collections" on collections
  for select using (is_public = true);

create policy "public read places of shared collections" on places
  for select using (
    exists (
      select 1 from collections
      where collections.id = places.collection_id
      and collections.is_public = true
    )
  );

-- Supabase grants table-level select to anon/authenticated by default, but
-- this makes it explicit and idempotent regardless of project defaults.
grant select on collections to anon;
grant select on places to anon;
