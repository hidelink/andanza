-- Marks places whose reel extraction failed after retries so they can be
-- surfaced with a "needs review" badge and a link back to the source post.
-- Run this once in the Supabase SQL Editor.

alter table places add column if not exists needs_review boolean not null default false;
