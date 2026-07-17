-- Adds per-user ownership so RLS actually isolates data between accounts.
-- Run this once in the Supabase SQL Editor.

alter table collections add column if not exists user_id uuid references auth.users(id);
alter table places add column if not exists user_id uuid references auth.users(id);
alter table itineraries add column if not exists user_id uuid references auth.users(id);

update collections set user_id = 'f72252bc-ab30-4bc0-94ae-40a3fe030a43' where user_id is null;
update places set user_id = 'f72252bc-ab30-4bc0-94ae-40a3fe030a43' where user_id is null;
update itineraries set user_id = 'f72252bc-ab30-4bc0-94ae-40a3fe030a43' where user_id is null;

alter table collections alter column user_id set not null;
alter table collections alter column user_id set default auth.uid();
alter table places alter column user_id set not null;
alter table places alter column user_id set default auth.uid();
alter table itineraries alter column user_id set not null;
alter table itineraries alter column user_id set default auth.uid();

drop policy if exists "authenticated full access" on collections;
drop policy if exists "authenticated full access" on places;
drop policy if exists "authenticated full access" on itineraries;

create policy "owner full access" on collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner full access" on places
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner full access" on itineraries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
