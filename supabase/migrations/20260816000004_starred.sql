-- ============================================================
-- Migration 002 — Starred (favorites)
-- Adds a simple boolean favorite flag on recipes, independent
-- of the pipeline stage. Run this whole file at once.
-- ============================================================

alter table recipes
  add column if not exists starred boolean not null default false;

-- Index so "starred only" filtering stays fast as the collection grows.
create index if not exists idx_recipes_starred on recipes (starred) where starred;
