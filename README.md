# La Cucina di Feeny & Beeny

A private recipe diary for two — a shared cookbook with a vintage feel, room for messy handwritten clippings, and a running log of what you've actually cooked together.

The app is gated by an email allow-list, so a deployment is meant for one household / pair of friends at a time. Fork it, swap the title and allowed emails, and make it yours.

## What's in it

- **Three ways to add a recipe** — paste a URL (auto-scraped to structured form), upload a photo of a handwritten card / cookbook page (OCR'd with Claude), or type one in by hand. Recipes can be fully structured (ingredients + steps), freeform text, or photo-only.
- **Categories, tags, and seasons** — multi-select filters on the recipe list.
- **Per-user status** — each person marks recipes as *want to try* or *made it*, independently.
- **Cook log** — every time you cook something, log the date, add a note and a photo. Drop emoji reactions on each other's entries.
- **Comments** — a thread per recipe.
- **HEIC support** — photos straight from an iPhone are converted in the browser before upload.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind v4, React Router 7, TanStack Query
- **Backend:** Supabase — Postgres + Auth + Storage, with RLS gated on the `allowed_emails` table
- **Edge functions (Deno):**
  - `scrape-recipe` — fetches a URL and extracts a structured recipe (JSON-LD first, falls back to Claude)
  - `ocr-recipe` — sends one or more recipe photos to Claude and returns structured ingredients + steps

## Running locally

You'll need a Supabase project and an Anthropic API key (for OCR + scrape fallback).

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Set up the database
# Open the Supabase SQL editor and run supabase/schema.sql
# Then uncomment the seed block at the bottom and add your allowed emails:
#
#   insert into allowed_emails (email) values
#     ('you@example.com'),
#     ('friend@example.com');

# 4. Deploy the edge functions (requires the Supabase CLI)
supabase functions deploy scrape-recipe
supabase functions deploy ocr-recipe
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# 5. Run
npm run dev
```

Sign in with a magic link to one of the allow-listed emails. The first sign-in creates your profile; you can edit your display name and accent colour from the header avatar.

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — type-check + production build
- `npm run lint` — ESLint
- `npm run preview` — preview the production build

## Making it yours

A few places to tweak when you fork:

- **Title and favicon:** `index.html` (`<title>`) and `public/favicon.svg` (currently a tomato).
- **Wordmark:** `src/components/layout/Header.tsx`.
- **Allow list:** the `allowed_emails` table in Supabase. Add or remove rows as needed.
- **Categories:** the `recipe_category` enum in `supabase/schema.sql` and the labels in `src/lib/categories.ts`.
- **Accent colours:** defaults live in `src/lib/person-color.ts`; each user can override their own from the profile menu.

## Project layout

```
src/
  components/
    auth/        — login, allow-list gate
    layout/      — header, app shell
    recipes/     — list, detail, form, cook log, comments
    illustrations/
  hooks/         — data hooks (recipes, comments, cook log, status)
  lib/           — supabase client, types, categories, image resize
supabase/
  schema.sql     — full DB schema with RLS policies
  functions/     — Deno edge functions
```
