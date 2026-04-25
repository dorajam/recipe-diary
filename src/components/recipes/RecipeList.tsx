import { useState, useMemo } from 'react'
import { useRecipes } from '../../hooks/use-recipes'
import { useRecipeFirstImages } from '../../hooks/use-recipe-first-images'
import { useAllRecipeStatuses } from '../../hooks/use-recipe-status'
import { useAuth } from '../../hooks/use-auth'
import { RecipeCard } from './RecipeCard'
import { Tomato, Basil, Lemon, Pepper, Garlic, Wine, PastaNest } from '../illustrations/Produce'
import { CATEGORIES } from '../../lib/categories'
import type { RecipeCategory, RecipeStatus, RecipeWithProfile } from '../../lib/types'

type StatusFilter = 'all' | RecipeStatus

interface FilterChip {
  value: StatusFilter
  it: string
  en: string
}

const STATUS_CHIPS: FilterChip[] = [
  { value: 'all',         it: 'Tutto',     en: 'EVERYTHING' },
  { value: 'want_to_try', it: 'Da provare', en: 'WANT TO TRY' },
  { value: 'made_it',     it: 'Fatto',      en: 'MADE IT' },
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

  const [search, setSearch] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<RecipeCategory | 'all'>('all')

  const filtered = useMemo(() => {
    if (!recipes) return []
    let result = recipes

    if (search.trim()) {
      result = result.filter((r) => matchesSearch(r, search.trim()))
    }

    if (statusFilter !== 'all' && statuses) {
      result = result.filter((r) => statuses[r.id] === statusFilter)
    }

    if (categoryFilter !== 'all') {
      result = result.filter((r) => r.categories?.includes(categoryFilter))
    }

    return result
  }, [recipes, search, statusFilter, categoryFilter, statuses])

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

  const hasActiveCategoryFilter = categoryFilter !== 'all'

  // Friend activity note
  const friendRecipes = recipes.filter((r) => r.added_by !== user?.id)
  const friendProfile = friendRecipes[0]?.profiles
  const friendRecentCount = friendRecipes.filter((r) => {
    const age = Date.now() - new Date(r.created_at).getTime()
    return age < 7 * 24 * 60 * 60 * 1000
  }).length

  return (
    <div className="space-y-7">
      {/* Greeting line */}
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="m-0 text-2xl sm:text-3xl tracking-tight">
          {getGreeting()}
          {profile ? `, ${getNickname(profile.email, profile.display_name)}` : ''}
        </h2>
        {friendProfile && friendRecentCount > 0 && (
          <p className="m-0 font-script text-lg text-tomato/80">
            {getNickname(friendProfile.email, friendProfile.display_name)} added{' '}
            {friendRecentCount} {friendRecentCount === 1 ? 'recipe' : 'recipes'} this
            week ✨
          </p>
        )}
      </div>

      {/* Filter rail — italian eyebrow chips */}
      <div className="border-b border-border">
        <div className="flex items-stretch flex-wrap">
          {STATUS_CHIPS.map((chip) => {
            const active = statusFilter === chip.value
            return (
              <button
                key={chip.value}
                onClick={() => setStatusFilter(chip.value)}
                className="text-left py-2.5 px-4 sm:px-5 border-r border-border cursor-pointer transition-colors hover:bg-bg-card/60"
                style={{
                  background: active ? 'var(--color-bg-card)' : 'transparent',
                  borderTop: active
                    ? '3px solid var(--color-tomato)'
                    : '3px solid transparent',
                  marginBottom: -1,
                }}
              >
                <div
                  className="font-display italic leading-none"
                  style={{
                    fontSize: 16,
                    color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {chip.it}
                </div>
                <div
                  className="font-mono mt-1 font-bold"
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.18em',
                    color: active ? 'var(--color-tomato)' : 'var(--color-text-muted)',
                    opacity: 0.85,
                  }}
                >
                  {chip.en}
                </div>
              </button>
            )
          })}

          <button
            onClick={() => setShowCategories(!showCategories)}
            className="py-2.5 px-4 sm:px-5 cursor-pointer text-left border-r border-border hover:bg-bg-card/60 transition-colors"
            style={{
              background: showCategories ? 'var(--color-bg-card)' : 'transparent',
              borderTop: showCategories
                ? '3px solid var(--color-basil)'
                : '3px solid transparent',
              marginBottom: -1,
            }}
          >
            <div
              className="font-display italic leading-none"
              style={{
                fontSize: 16,
                color: showCategories ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: showCategories ? 600 : 500,
              }}
            >
              Categorie
            </div>
            <div
              className="font-mono mt-1 font-bold"
              style={{
                fontSize: 9,
                letterSpacing: '0.18em',
                color: showCategories ? 'var(--color-basil)' : 'var(--color-text-muted)',
                opacity: 0.85,
              }}
            >
              {hasActiveCategoryFilter ? '· ACTIVE ·' : 'CATEGORIES'}
            </div>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2.5 items-center">
        <div className="relative flex-1">
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 font-mono text-sm
              bg-bg-card border border-border text-text
              placeholder:text-text-muted/50 placeholder:italic
              focus:outline-none focus:border-tomato transition-colors"
            style={{ borderRadius: 2 }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-tomato cursor-pointer text-lg leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Categories panel (collapsible) */}
      {showCategories && (
        <div
          className="bg-bg-card border border-border p-4 sm:p-5 space-y-3"
          style={{ borderRadius: 2 }}
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className="px-3 py-1.5 text-xs font-mono uppercase font-bold cursor-pointer transition-colors"
              style={{
                background: categoryFilter === 'all' ? 'var(--color-text)' : 'transparent',
                color: categoryFilter === 'all' ? 'var(--color-cream)' : 'var(--color-text-muted)',
                border: '1.5px solid var(--color-border)',
                letterSpacing: '0.18em',
                borderRadius: 2,
              }}
            >
              Tutto
            </button>
            {CATEGORIES.map((c) => {
              const active = categoryFilter === c.value
              return (
                <button
                  key={c.value}
                  onClick={() => setCategoryFilter(active ? 'all' : c.value)}
                  className="px-3 py-1.5 cursor-pointer transition-colors"
                  style={{
                    background: active ? 'var(--color-basil)' : 'transparent',
                    color: active ? 'var(--color-cream)' : 'var(--color-text)',
                    border: `1.5px solid ${active ? 'var(--color-basil)' : 'var(--color-border)'}`,
                    borderRadius: 2,
                  }}
                >
                  <span className="font-display italic text-sm leading-none mr-1.5">
                    {CATEGORY_IT[c.value]}
                  </span>
                  <span
                    className="font-mono text-[9px] font-bold uppercase"
                    style={{ letterSpacing: '0.16em', opacity: 0.75 }}
                  >
                    {c.label}
                  </span>
                </button>
              )
            })}
          </div>
          {hasActiveCategoryFilter && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="font-mono text-xs uppercase text-text-muted hover:text-tomato cursor-pointer"
              style={{ letterSpacing: '0.18em' }}
            >
              · clear ·
            </button>
          )}
        </div>
      )}

      {/* Recipe grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              image={firstImages[recipe.id]}
              status={statuses?.[recipe.id]}
            />
          ))}
        </div>
      ) : (search.trim() || statusFilter !== 'all' || hasActiveCategoryFilter) ? (
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
