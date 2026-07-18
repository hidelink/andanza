-- Adds country/region tracking to places (used to auto-organize reels by
-- country, with region shown as a subheading), then clears the manually
-- created collections on hidelink@gmail.com's account so the new
-- auto-organize flow starts from a clean slate.
-- Run this once in the Supabase SQL Editor.

alter table places add column if not exists country text;
alter table places add column if not exists region text;

delete from collections where user_id = 'f72252bc-ab30-4bc0-94ae-40a3fe030a43';
