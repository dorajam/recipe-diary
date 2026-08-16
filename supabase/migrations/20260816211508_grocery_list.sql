-- ============================================================
-- Grocery list — a simple shared weekly shopping checklist.
-- Free-typed items, checkable, ordered. One list per user.
-- ============================================================

create table if not exists grocery_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  label text not null,
  checked boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_grocery_items_user on grocery_items (user_id);

alter table grocery_items enable row level security;

-- Allowed users manage only their own items.
create policy "Users read own grocery items"
  on grocery_items for select to authenticated
  using (is_allowed_user() and user_id = auth.uid());

create policy "Users insert own grocery items"
  on grocery_items for insert to authenticated
  with check (is_allowed_user() and user_id = auth.uid());

create policy "Users update own grocery items"
  on grocery_items for update to authenticated
  using (is_allowed_user() and user_id = auth.uid());

create policy "Users delete own grocery items"
  on grocery_items for delete to authenticated
  using (is_allowed_user() and user_id = auth.uid());
