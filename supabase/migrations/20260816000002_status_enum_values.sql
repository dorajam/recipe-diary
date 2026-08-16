-- ============================================================
-- Migration 001a — Add the pipeline enum values (RUN FIRST, ALONE)
-- Run this whole file, on its own, and let it finish.
-- Then run 001b_status_pipeline_data.sql in a SEPARATE run.
-- Idempotent: safe to run more than once.
-- ============================================================

alter type recipe_status add value if not exists 'saved';
alter type recipe_status add value if not exists 'planned';
alter type recipe_status add value if not exists 'cooked';
alter type recipe_status add value if not exists 'candidate';

-- Verify (optional): after running, this should list all six values
-- (the two old ones + the four new ones).
-- select enumlabel from pg_enum
-- where enumtypid = 'recipe_status'::regtype order by enumsortorder;
