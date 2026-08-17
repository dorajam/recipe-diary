# Dora's Recipe Diary

Do you spend hours each week doom-scrolling and saving beautiful recipes that you never end up making? Yes, me too.

It's frustrating. You save recipes, but there is no way to actually search for them.

This is why I created this app: to have a seamless interface to find my saved recipes. And eventually to help me organize my notes for a cookbook I'm working on.

This app is a personal recipe diary that turns a pile of saved Instagram links and blog bookmarks into recipes I can seamlessly search, navigate, refine and eventually use towards my **cookbook**.

The core idea is simple: recipes moves through **saved → planned → cooked → adjustments → book candidate**, and the whole app is built to push recipes rightward — from something I dumped in a hurry to a dish I've made, refined, tested and would put in a book.

> Credits to my wonderful friend Athena for the initial idea + beautiful design: [athfu/recipe-diary](https://github.com/athfu/recipe-diary) (originally "La Cucina di Feeny & Beeny", a shared two-person diary) and reworked into a single-user, cookbook-focused app. See [What I changed](#what-i-changed-from-the-fork) below.

## What's in it

**Collect** — fill the funnel and make it searchable
- **Add a recipe three ways** — paste a URL (auto-scraped to a structured recipe), save an **Instagram reel** (embedded + cover photo auto-grabbed), or type one in by hand with ingredients, method, servings, and notes.
- **Custom tags** — free-form tags like `summer salad` or `high-protein`, with autocomplete from tags you've used before.
- **Fuzzy search + filters** — search matches titles, ingredients, and tags partially (typing "summer" finds "summer salad"), plus category and pipeline-stage filters.
- **Starred favorites** — a dedicated tab for the ones you love.

**Cook** — the engine that produces the cookbook
- **This Week** — a weekly plan: pull 1–3 recipes into a shortlist so browsing turns into cooking. Comes with a **shopping list** side panel.
- **Cook log** — log each time you make something with a date, a **1–5 star rating**, a **"what I changed"** field, notes, and a photo.
- **Add to cookbook** — a deliberate "this one's good enough" action that promotes a recipe to a **book candidate**, so you can watch the collection you'll actually publish grow.

**Nice touches**
- **Instagram reels play inline** on the recipe page — no leaving the app.
- **HEIC support** — iPhone photos are converted in the browser before upload.
- Magic-link email sign-in, gated by an allow-list.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind v4, React Router 7, TanStack Query
- **Backend:** Supabase — Postgres + Auth + Storage, with RLS gated on the `allowed_emails` table
- **Edge functions (Deno):**
  - `scrape-recipe` — fetches a URL and extracts a structured recipe (JSON-LD first, Claude fallback)
  - `instagram-thumbnail` — grabs a public reel's cover image (oEmbed / og:image; no API key needed)
  - `ocr-recipe` — sends recipe photos to Claude and returns structured ingredients + steps

## Running locally

You'll need a Supabase project. An Anthropic API key is optional (only needed for photo OCR and the scrape fallback on sites without structured data).

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Set up the database
#    Run supabase/schema.sql in the Supabase SQL editor, then apply the
#    migrations in supabase/migrations/ (or `supabase db push` if linked).
#    Add your allow-listed email:
#      insert into allowed_emails (email) values ('you@example.com');

# 4. Deploy the edge functions (requires the Supabase CLI)
supabase functions deploy scrape-recipe
supabase functions deploy instagram-thumbnail
supabase functions deploy ocr-recipe
# Optional — enables OCR + scrape fallback:
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# 5. Run
npm run dev
```

Sign in with a magic link to your allow-listed email. The first sign-in creates your profile.

> **Note:** Supabase's free tier pauses a project after ~7 days idle, which surfaces as a "Failed to fetch" error. Restart it from the Supabase dashboard to wake it.

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — type-check + production build
- `npm run lint` — ESLint
- `npm run preview` — preview the production build

## What I changed from the fork

- **Single-user, not a two-person diary** — rebranded to "Dora's Kitchen"; UI is English-first with a little Italian flavor.
- **Cookbook pipeline** — replaced the `want_to_try` / `made_it` status with a four-stage `saved → planned → cooked → candidate` pipeline (`src/lib/pipeline.ts`).
- **This Week planning + shopping list** — a new dedicated view and a `grocery_items` table.
- **Custom tags with fuzzy search** — a real tag editor (`src/components/recipes/TagEditor.tsx`, `src/hooks/use-tags.ts`) wired into search.
- **Instagram reels** — embed the reel and auto-grab its cover photo (`instagram-thumbnail` function) instead of failing to scrape.
- **Richer cook log** — added star ratings and a "what I changed" field; "Add to cookbook" promotion.
- **Manual recipe fields always available** — ingredients / method / servings / notes are editable when creating any recipe.
- **Auth** — magic-link email sign-in with reliable session persistence.

## Project layout

```
src/
  components/
    auth/        — login, allow-list gate
    layout/      — header, app shell
    recipes/     — list, detail, form, cook log, tags, grocery list, This Week
    illustrations/
  hooks/         — data hooks (recipes, tags, cook log, status, grocery)
  lib/           — supabase client, pipeline stages, types, categories, image resize
supabase/
  schema.sql     — base DB schema with RLS policies
  migrations/    — pipeline, starred, grocery list, cook-log fields
  functions/     — Deno edge functions
```
