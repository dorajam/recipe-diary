-- Phase 3 — richer cook logging for the cookbook.
-- rating: 1–5 (nullable), changes: distinct "what I modified" field.
alter table cook_log
  add column if not exists rating smallint
    check (rating is null or (rating between 1 and 5));

alter table cook_log
  add column if not exists changes text;
