import { useState, useMemo } from 'react'
import { useRecipes } from '../../hooks/use-recipes'
import { useRecipeFirstImages } from '../../hooks/use-recipe-first-images'
import { useAllRecipeStatuses } from '../../hooks/use-recipe-status'
import { useAllCookCounts } from '../../hooks/use-cook-log'
import { useAuth } from '../../hooks/use-auth'
import { RecipeCard } from './RecipeCard'
import { Tomato, Basil, Lemon, Pepper, Garlic, Wine, PastaNest } from '../illustrations/Produce'
import { CATEGORIES } from '../../lib/categories'
import type { RecipeCategory, RecipeStatus, RecipeWithProfile } from '../../lib/types'

type StatusFilter = 'all' | RecipeStatus

const STATUS_TABS: {
  value: StatusFilter
  label: string
  mobileLabel: string
}[] = [
  { value: 'all', label: 'Tutto', mobileLabel: 'Tutto' },
  { value: 'want_to_try', label: 'Da provare', mobileLabel: 'Provare' },
  { value: 'made_it', label: 'Fatto', mobileLabel: 'Fatto' },
]

const CATEGORY_IT: Record<RecipeCategory, string> = {
  breakfast: 'Colazione',
  starter:   'Antipasto',
  main:      'Primo',
  side:      'Contorno',
  soup_stew: 'Zuppa',
  salad:     'Insalata',
  dessert:   'Dolce',
  baking:    'Da forno',
  snack:     'Spuntino',
  drink:     'Da bere',
  sauce_dip: 'Salsa',
}

const CATEGORY_COLORS: Partial<Record<RecipeCategory, string>> = {
  breakfast: 'var(--color-ackee)',
  starter:   'var(--color-tomato)',
  main:      'var(--color-tomato)',
  side:      'var(--color-basil)',
  salad:     'var(--color-basil)',
  baking:    'var(--color-ackee)',
}

function categoryFill(value: RecipeCategory): string {
  return CATEGORY_COLORS[value] ?? 'var(--color-text)'
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buongiorno'
  if (hour < 17) return 'Buon pomeriggio'
  return 'Buonasera'
}

const NICKNAMES: Record<string, string> = {
  'athenafung25@gmail.com': 'Feeny',
  'sabrinaeandrenacci@gmail.com': 'Beeny',
}

function getNickname(email: string, fallbackName: string): string {
  return NICKNAMES[email] || fallbackName.split(' ')[0]
}

function matchesSearch(recipe: RecipeWithProfile, query: string): boolean {
  const q = query.toLowerCase()
  if (recipe.title.toLowerCase().includes(q)) return true
  if (recipe.description?.toLowerCase().includes(q)) return true
  if (recipe.ingredients?.some((ing) => ing.item.toLowerCase().includes(q))) return true
  if (recipe.freeform_text?.toLowerCase().includes(q)) return true
  return false
}

export function RecipeList() {
  const { user, profile } = useAuth()
  const { data: recipes, isLoading, error } = useRecipes()
  const firstImages = useRecipeFirstImages(recipes?.map((r) => r.id))
  const { data: statuses } = useAllRecipeStatuses(user?.id)
  const { data: cookCounts } = useAllCookCounts()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedCats, setSelectedCats] = useState<RecipeCategory[]>([])

  const counts = useMemo(() => {
    if (!recipes) return { all: 0, want_to_try: 0, made_it: 0 }
    let want = 0
    let made = 0
    for (const r of recipes) {
      const s = statuses?.[r.id]
      if (s === 'want_to_try') want++
      else if (s === 'made_it') made++
    }
    return { all: recipes.length, want_to_try: want, made_it: made }
  }, [recipes, statuses])

  const filtered = useMemo(() => {
    if (!recipes) return []
    let result = recipes

    if (search.trim()) {
      result = result.filter((r) => matchesSearch(r, search.trim()))
    }

    if (statusFilter !== 'all' && statuses) {
      result = result.filter((r) => statuses[r.id] === statusFilter)
    }

    if (selectedCats.length > 0) {
      result = result.filter((r) =>
        r.categories?.some((c) => selectedCats.includes(c)),
      )
    }

    return result
  }, [recipes, search, statusFilter, selectedCats, statuses])

  if (isLoading) {
    return (
      <div className="text-center py-24 text-text-muted">
        <PastaNest size={64} className="mx-auto mb-4 opacity-50 animate-pulse" />
        <p className="font-mono text-sm">caricamento...</p>
      </div>
    )
  }

  if (error) {
    console.error('Recipe list error:', error)
    return (
      <div className="text-center py-20 text-tomato font-mono text-sm">
        Something went wrong loading recipes.
      </div>
    )
  }

  if (!recipes?.length) {
    return (
      <div className="text-center py-24 space-y-5">
        <Tomato size={96} className="mx-auto" />
        <p className="font-display italic text-3xl text-text m-0">
          La cucina è vuota.
        </p>
        <p className="font-mono text-sm text-text-muted m-0">
          The kitchen is empty — add your first recipe to get cooking.
        </p>
      </div>
    )
  }

  function toggleCat(value: RecipeCategory) {
    setSelectedCats((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    )
  }

  function clearCats() {
    setSelectedCats([])
  }

  // Friend activity note
  const friendRecipes = recipes.filter((r) => r.added_by !== user?.id)
  const friendProfile = friendRecipes[0]?.profiles
  const friendRecentCount = friendRecipes.filter((r) => {
    const age = Date.now() - new Date(r.created_at).getTime()
    return age < 7 * 24 * 60 * 60 * 1000
  }).length

  const firstName = profile
    ? getNickname(profile.email, profile.display_name)
    : ''

  const allCatsActive = selectedCats.length === 0

  return (
    <div className="space-y-6">
      {/* ── Mobile greeting (eyebrow + name) ── */}
      <div className="sm:hidden flex items-baseline gap-2">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.3em',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
          }}
        >
          {getGreeting()} ·
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--color-text)',
          }}
        >
          {firstName}
        </span>
      </div>

      {/* ── Desktop greeting ── */}
      <div className="hidden sm:flex items-baseline justify-between gap-4 flex-wrap">
        <h2
          className="m-0 text-[24px] leading-[1.1]"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: 'var(--color-text)',
          }}
        >
          {getGreeting()}
          {firstName ? `, ${firstName}` : ''}
        </h2>
        {friendProfile && friendRecentCount > 0 && (
          <p className="m-0 font-script text-lg text-tomato/80">
            {getNickname(friendProfile.email, friendProfile.display_name)} added{' '}
            {friendRecentCount} {friendRecentCount === 1 ? 'recipe' : 'recipes'} this
            week ✨
          </p>
        )}
      </div>

      {/* ── Desktop: status tabs row + search ── */}
      <div
        className="hidden sm:flex flex-wrap items-stretch gap-y-2"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {STATUS_TABS.map(({ value, label }) => {
          const active = statusFilter === value
          const n =
            value === 'all'
              ? counts.all
              : value === 'want_to_try'
                ? counts.want_to_try
                : counts.made_it
          return (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 22px',
                cursor: 'pointer',
                borderBottom: active
                  ? '2px solid var(--color-tomato)'
                  : '2px solid transparent',
                marginBottom: -1,
                color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 8,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 18,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {label}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontStyle: 'normal',
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  fontWeight: 500,
                }}
              >
                {n}
              </span>
            </button>
          )
        })}
        <div
          style={{
            alignSelf: 'center',
            width: 280,
            maxWidth: '100%',
            marginLeft: 'auto',
            flexShrink: 0,
            paddingBottom: 6,
          }}
        >
          <SearchInput value={search} onChange={setSearch} />
        </div>
      </div>

      {/* ── Desktop: category chip rail ── */}
      <div
        className="hidden sm:flex flex-wrap"
        style={{ gap: 8, marginTop: 18 }}
      >
        <button
          onClick={clearCats}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '6px 12px',
            borderRadius: 999,
            background: allCatsActive ? 'var(--color-text)' : 'transparent',
            color: allCatsActive ? 'var(--color-cream)' : 'var(--color-text)',
            border: allCatsActive ? 'none' : '1px solid var(--color-border)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          ALL CATEGORIES
        </button>
        {CATEGORIES.map(({ value, label }) => {
          const active = selectedCats.includes(value)
          const fill = categoryFill(value)
          return (
            <button
              key={value}
              onClick={() => toggleCat(value)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                cursor: 'pointer',
                background: active ? fill : 'transparent',
                color: active ? 'var(--color-cream)' : 'var(--color-text)',
                border: active ? 'none' : '1px solid var(--color-border)',
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {CATEGORY_IT[value]}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: active
                    ? 'rgba(255,250,238,0.75)'
                    : 'var(--color-text-muted)',
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Mobile: segmented status control ── */}
      <div
        className="sm:hidden flex"
        style={{
          gap: 0,
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          padding: 2,
          background: 'var(--color-bg-warm)',
        }}
      >
        {STATUS_TABS.map(({ value, mobileLabel }) => {
          const active = statusFilter === value
          return (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              style={{
                flex: 1,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 13,
                fontWeight: 500,
                padding: '8px 4px',
                borderRadius: 3,
                background: active ? 'var(--color-bg-card)' : 'transparent',
                color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: active ? '1px 1px 0 var(--color-text)' : 'none',
              }}
            >
              {mobileLabel}
            </button>
          )
        })}
      </div>

      {/* ── Mobile: search ── */}
      <div className="sm:hidden">
        <SearchInput value={search} onChange={setSearch} />
      </div>

      {/* ── Mobile: horizontal chip rail ── */}
      <div
        className="sm:hidden flex"
        style={{
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          marginLeft: -22,
          marginRight: -22,
          paddingLeft: 22,
          paddingRight: 22,
        }}
      >
        <button
          onClick={clearCats}
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 13,
            fontWeight: 500,
            padding: '6px 12px',
            borderRadius: 999,
            flexShrink: 0,
            background: allCatsActive ? 'var(--color-text)' : 'transparent',
            color: allCatsActive ? 'var(--color-cream)' : 'var(--color-text)',
            border: allCatsActive ? 'none' : '1px solid var(--color-border)',
            cursor: 'pointer',
          }}
        >
          Tutte
        </button>
        {CATEGORIES.map(({ value }) => {
          const active = selectedCats.includes(value)
          const fill = categoryFill(value)
          return (
            <button
              key={value}
              onClick={() => toggleCat(value)}
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 13,
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: 999,
                flexShrink: 0,
                background: active ? fill : 'transparent',
                color: active ? 'var(--color-cream)' : 'var(--color-text)',
                border: active ? 'none' : '1px solid var(--color-border)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {CATEGORY_IT[value]}
            </button>
          )
        })}
      </div>

      {/* ── Recipe grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-start pt-2">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              image={firstImages[recipe.id]}
              status={statuses?.[recipe.id]}
              cookedCount={cookCounts?.[recipe.id] ?? 0}
            />
          ))}
        </div>
      ) : (search.trim() || statusFilter !== 'all' || selectedCats.length > 0) ? (
        <div className="text-center py-20 space-y-4">
          <div className="flex justify-center gap-2 opacity-70">
            <Lemon size={56} />
            <Pepper size={56} />
            <Garlic size={56} />
          </div>
          <p className="font-display italic text-2xl text-text m-0">
            Niente da trovare.
          </p>
          <p className="font-mono text-sm text-text-muted m-0">
            Nothing matches — try a different search or filter.
          </p>
        </div>
      ) : null}

      {/* Footer flourish */}
      <div className="pt-10 pb-4 flex items-center justify-center gap-3 opacity-50">
        <Wine size={32} />
        <span
          className="font-mono text-[10px] font-bold"
          style={{ letterSpacing: '0.32em', color: 'var(--color-text-muted)' }}
        >
          BUON APPETITO
        </span>
        <Basil size={32} />
      </div>
    </div>
  )
}

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
}

function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder="cerca ricette..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 font-mono text-sm
          bg-bg-card border border-border text-text
          placeholder:text-text-muted/50 placeholder:italic
          focus:outline-none focus:border-tomato transition-colors"
        style={{ borderRadius: 2 }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-tomato cursor-pointer text-lg leading-none"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}
