-- Recipe Diary — Full Schema
-- Run this in the Supabase SQL Editor to set up the database.

-- ============================================================
-- ENUMS
-- ============================================================

create type source_type as enum ('manual', 'url', 'photo');
create type content_type as enum ('structured', 'freeform', 'photo_only');
create type image_type as enum ('source_photo', 'dish_photo', 'illustration');
create type recipe_status as enum ('want_to_try', 'made_it');

-- ============================================================
-- TABLES
-- ============================================================

-- Email allow list — only these accounts can use the app
create table allowed_emails (
  email text primary key,
  created_at timestamptz default now()
);

-- User profiles, linked to Supabase Auth
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text not null default '',
  accent_colour text not null default '#A47BE0',
  avatar_url text,
  created_at timestamptz default now()
);

-- Core recipe table
create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  source_url text,
  source_type source_type not null default 'manual',
  content_type content_type not null default 'freeform',
  ingredients jsonb,        -- array of { amount, unit, item }
  steps jsonb,              -- array of strings
  freeform_text text,
  ocr_text text,
  servings text,
  added_by uuid not null references profiles on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Recipe images (photos, source scans, illustrations)
create table recipe_images (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes on delete cascade,
  image_url text not null,   -- Supabase Storage path
  image_type image_type not null default 'dish_photo',
  caption text,
  uploaded_by uuid not null references profiles on delete cascade,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Flat tags
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null  -- lowercase, trimmed
);

-- Recipe ↔ Tag junction
create table recipe_tags (
  recipe_id uuid not null references recipes on delete cascade,
  tag_id uuid not null references tags on delete cascade,
  primary key (recipe_id, tag_id)
);

-- Personal status per recipe per user
create table user_recipe_status (
  recipe_id uuid not null references recipes on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  status recipe_status,
  primary key (recipe_id, user_id)
);

-- Cook log entries
create table cook_log (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes on delete cascade,
  cooked_by uuid not null references profiles on delete cascade,
  cooked_on date not null default current_date,
  note text,
  photo_url text,            -- Supabase Storage path
  created_at timestamptz default now()
);

-- Comments thread per recipe
create table comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes on delete cascade,
  author_id uuid not null references profiles on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_recipes_added_by on recipes (added_by);
create index idx_recipes_created_at on recipes (created_at desc);
create index idx_recipe_images_recipe_id on recipe_images (recipe_id);
create index idx_recipe_tags_recipe_id on recipe_tags (recipe_id);
create index idx_recipe_tags_tag_id on recipe_tags (tag_id);
create index idx_cook_log_recipe_id on cook_log (recipe_id);
create index idx_comments_recipe_id on comments (recipe_id);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_updated_at
  before update on recipes
  for each row execute function update_updated_at();

-- ============================================================
-- RLS HELPER — checks if the current user's email is allowed
-- ============================================================

create or replace function is_allowed_user()
returns boolean as $$
begin
  return exists (
    select 1 from allowed_emails
    where email = (auth.jwt() ->> 'email')
  );
end;
$$ language plpgsql security definer;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

alter table allowed_emails enable row level security;
alter table profiles enable row level security;
alter table recipes enable row level security;
alter table recipe_images enable row level security;
alter table tags enable row level security;
alter table recipe_tags enable row level security;
alter table user_recipe_status enable row level security;
alter table cook_log enable row level security;
alter table comments enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- allowed_emails: only allowed users can read (nobody can write via API)
create policy "Allowed users can read allow list"
  on allowed_emails for select
  to authenticated
  using (is_allowed_user());

-- profiles
create policy "Allowed users can read profiles"
  on profiles for select to authenticated using (is_allowed_user());

create policy "Allowed users can insert own profile"
  on profiles for insert to authenticated
  with check (is_allowed_user() and id = auth.uid());

create policy "Allowed users can update own profile"
  on profiles for update to authenticated
  using (is_allowed_user() and id = auth.uid());

-- recipes
create policy "Allowed users can read recipes"
  on recipes for select to authenticated using (is_allowed_user());

create policy "Allowed users can create recipes"
  on recipes for insert to authenticated
  with check (is_allowed_user() and added_by = auth.uid());

create policy "Allowed users can update recipes"
  on recipes for update to authenticated
  using (is_allowed_user());

create policy "Allowed users can delete recipes"
  on recipes for delete to authenticated
  using (is_allowed_user());

-- recipe_images
create policy "Allowed users can read images"
  on recipe_images for select to authenticated using (is_allowed_user());

create policy "Allowed users can upload images"
  on recipe_images for insert to authenticated
  with check (is_allowed_user() and uploaded_by = auth.uid());

create policy "Allowed users can update images"
  on recipe_images for update to authenticated
  using (is_allowed_user());

create policy "Allowed users can delete images"
  on recipe_images for delete to authenticated
  using (is_allowed_user());

-- tags
create policy "Allowed users can read tags"
  on tags for select to authenticated using (is_allowed_user());

create policy "Allowed users can create tags"
  on tags for insert to authenticated
  with check (is_allowed_user());

-- recipe_tags
create policy "Allowed users can read recipe_tags"
  on recipe_tags for select to authenticated using (is_allowed_user());

create policy "Allowed users can create recipe_tags"
  on recipe_tags for insert to authenticated
  with check (is_allowed_user());

create policy "Allowed users can delete recipe_tags"
  on recipe_tags for delete to authenticated
  using (is_allowed_user());

-- user_recipe_status
create policy "Allowed users can read status"
  on user_recipe_status for select to authenticated using (is_allowed_user());

create policy "Allowed users can set own status"
  on user_recipe_status for insert to authenticated
  with check (is_allowed_user() and user_id = auth.uid());

create policy "Allowed users can update own status"
  on user_recipe_status for update to authenticated
  using (is_allowed_user() and user_id = auth.uid());

create policy "Allowed users can delete own status"
  on user_recipe_status for delete to authenticated
  using (is_allowed_user() and user_id = auth.uid());

-- cook_log
create policy "Allowed users can read cook log"
  on cook_log for select to authenticated using (is_allowed_user());

create policy "Allowed users can add cook log"
  on cook_log for insert to authenticated
  with check (is_allowed_user() and cooked_by = auth.uid());

create policy "Allowed users can update own cook log"
  on cook_log for update to authenticated
  using (is_allowed_user() and cooked_by = auth.uid());

create policy "Allowed users can delete own cook log"
  on cook_log for delete to authenticated
  using (is_allowed_user() and cooked_by = auth.uid());

-- comments
create policy "Allowed users can read comments"
  on comments for select to authenticated using (is_allowed_user());

create policy "Allowed users can add comments"
  on comments for insert to authenticated
  with check (is_allowed_user() and author_id = auth.uid());

create policy "Allowed users can update own comments"
  on comments for update to authenticated
  using (is_allowed_user() and author_id = auth.uid());

create policy "Allowed users can delete own comments"
  on comments for delete to authenticated
  using (is_allowed_user() and author_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true);

-- Storage RLS: authenticated allowed users can upload
create policy "Allowed users can upload to recipe-images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'recipe-images'
    and is_allowed_user()
  );

-- Anyone can read (public bucket)
create policy "Public read for recipe-images"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

-- Allowed users can delete their uploads
create policy "Allowed users can delete from recipe-images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'recipe-images'
    and is_allowed_user()
  );

-- ============================================================
-- SEED: Add your two allowed emails here
-- ============================================================

-- insert into allowed_emails (email) values
--   ('person-a@gmail.com'),
--   ('person-b@gmail.com');
