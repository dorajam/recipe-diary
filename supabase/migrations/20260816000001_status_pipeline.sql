-- ============================================================
-- Migration 001 — Status pipeline
-- Moves per-user recipe status from the old two-value model
-- (want_to_try / made_it) to the cookbook pipeline:
--   saved → planned → cooked → candidate
--
-- Run this in the Supabase SQL editor (whole file at once).
-- Safe to run once. Postgres cannot DROP enum values, so the
-- old values remain defined but unused — that's fine.
-- ============================================================

-- 1. Add the new pipeline stages to the enum.
--    (ADD VALUE IF NOT EXISTS is idempotent, so re-running is safe.)
alter type recipe_status add value if not exists 'saved';
alter type recipe_status add value if not exists 'planned';
alter type recipe_status add value if not exists 'cooked';
alter type recipe_status add value if not exists 'candidate';

-- IMPORTANT: Postgres will NOT let the new enum values be used in the
-- same run that added them ("unsafe use of new value" error). The steps
-- below (2 and 3) must be run SEPARATELY, after the ALTER TYPE lines above
-- have committed. Run them via the companion file:
--   001b_status_pipeline_data.sql
-- (The statements are kept here for reference / a from-scratch rebuild.)

-- 2. Migrate existing rows to the new stages.
--    want_to_try → planned   (you intended to make it)
--    made_it     → cooked    (you've made it)
update user_recipe_status set status = 'planned' where status = 'want_to_try';
update user_recipe_status set status = 'cooked'  where status = 'made_it';

-- 3. Backfill: every recipe that has NO status row for its owner
--    gets 'saved', so nothing sits outside the pipeline.
insert into user_recipe_status (recipe_id, user_id, status)
select r.id, r.added_by, 'saved'
from recipes r
where not exists (
  select 1 from user_recipe_status s
  where s.recipe_id = r.id and s.user_id = r.added_by
);
