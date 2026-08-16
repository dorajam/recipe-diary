-- ============================================================
-- Migration 001b — Status pipeline (DATA step)
-- Run this AFTER 001_status_pipeline.sql (whose enum additions
-- have now been committed). This is the part that hit the
-- "unsafe use of new value" error when run in the same batch.
-- Run this whole file on its own.
-- ============================================================

-- Migrate existing rows to the new stages.
update user_recipe_status set status = 'planned' where status = 'want_to_try';
update user_recipe_status set status = 'cooked'  where status = 'made_it';

-- Backfill: every recipe with no status row for its owner gets 'saved'.
insert into user_recipe_status (recipe_id, user_id, status)
select r.id, r.added_by, 'saved'
from recipes r
where not exists (
  select 1 from user_recipe_status s
  where s.recipe_id = r.id and s.user_id = r.added_by
);
