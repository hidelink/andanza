-- Instagram has several equivalent URL shapes for the same post (/p/, /reel/,
-- /tv/, with or without a username prefix, with or without tracking query
-- params like ?utm_source=... or ?igsh=...). Comparing raw URLs for duplicate
-- detection missed that these were the same post, so we add a normalized
-- shortcode column to match on instead.
-- Run this once in the Supabase SQL Editor.

alter table places add column if not exists reel_shortcode text;

update places
set reel_shortcode = substring(source_reel_url from '/(?:p|reel|tv)/([A-Za-z0-9_-]+)')
where source_reel_url is not null and reel_shortcode is null;

create index if not exists places_reel_shortcode_idx on places (reel_shortcode);
