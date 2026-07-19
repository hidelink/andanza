-- Personal tokens so an iOS Shortcut (or any external client with no browser
-- session/cookies) can authenticate a single "add this reel" request without
-- a full login flow.
-- Run this once in the Supabase SQL Editor.

create table if not exists share_tokens (
  user_id uuid primary key references auth.users(id),
  token text not null unique,
  created_at timestamptz not null default now()
);

alter table share_tokens enable row level security;

create policy "owner full access" on share_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
