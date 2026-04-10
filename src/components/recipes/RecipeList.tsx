import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecipes } from '../../hooks/use-recipes'
import { useRecipeFirstImages } from '../../hooks/use-recipe-first-images'
import { useAllRecipeStatuses } from '../../hooks/use-recipe-status'
import { useAuth } from '../../hooks/use-auth'
import { RecipeCard } from './RecipeCard'
import { CookbookDoodle, PotDoodle, Sparkles } from '../illustrations/Doodles'
import { CATEGORIES } from '../../lib/categories'
import { getSeason, SEASON_CONFIG } from '../../lib/season'
import type { RecipeCategory, RecipeStatus, RecipeWithProfile } from '../../lib/types'

type SortOption = 'newest' | 'alphabetical' | 'oldest'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'alphabetical', label: 'A–Z' },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getGreetingNudge(): string | null {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 10) return 'Breakfast ideas?'
  if (hour >= 11 && hour < 14) return 'What\'s for lunch?'
  if (hour >= 17 && hour < 21) return 'Time to cook dinner?'
  return null
}

const CARD_ROTATIONS = ['-0.8deg', '0.6deg', '-0.4deg', '1deg', '-0.6deg', '0.8deg']

type StatusFilter = 'all' | RecipeStatus

const STATUS_FILTERS: { value: RecipeStatus; label: string }[] = [
  { value: 'want_to_try', label: 'Want to try' },
  { value: 'made_it', label: 'Made it' },
]

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
  const navigate = useNavigate()
  const { data: recipes, isLoading, error } = useRecipes()
  const firstImages = useRecipeFirstImages(recipes?.map((r) => r.id))
  const { data: statuses } = useAllRecipeStatuses(user?.id)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<RecipeCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const searchRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Stable "recipe of the week" — pick changes each Monday
  const recipeOfTheWeekId = useMemo(() => {
    if (!recipes?.length) return null
    const now = new Date()
    // Week number seed: days since epoch / 7
    const weekSeed = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000))
    return recipes[weekSeed % recipes.length].id
  }, [recipes])

  const season = getSeason()
  const seasonCfg = SEASON_CONFIG[season]

  const handleRandomPick = useCallback(() => {
    if (!recipes?.length) return
    const pick = recipes[Math.floor(Math.random() * recipes.length)]
    navigate(`/recipes/${pick.id}`)
  }, [recipes, navigate])

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

    if (sortBy === 'alphabetical') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }
    // 'newest' is the default from the API

    return result
  }, [recipes, search, statusFilter, categoryFilter, sortBy, statuses])

  if (isLoading) {
    return (
      <div className="text-center py-20 text-text-muted">
        <PotDoodle className="w-16 h-auto mx-auto text-text-muted/20 mb-4 animate-pulse" />
        Loading recipes...
      </div>
    )
  }

  if (error) {
    console.error('Recipe list error:', error)
    return (
      <div className="text-center py-20 text-accent">
        Something went wrong loading recipes.
      </div>
    )
  }

  if (!recipes?.length) {
    return (
      <div className="text-center py-20 space-y-4">
        <CookbookDoodle className="w-28 h-auto mx-auto text-text-muted/40" />
        <p className="text-text-muted text-lg font-display">No recipes yet!</p>
        <p className="text-text-muted text-sm">
          Add your first recipe to get started.
        </p>
      </div>
    )
  }

  const hasActiveFilters = search.trim() || statusFilter !== 'all' || categoryFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Greeting + header */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl m-0 tracking-tight">
            {getGreeting()}{profile ? `, ${profile.display_name.split(' ')[0]}` : ''}
          </h2>
          <span className="text-text-muted text-xs">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </span>
        </div>
        {(getGreetingNudge() || seasonCfg.nudge) && (
          <p className="text-sm text-text-muted/60 m-0">
            {getGreetingNudge() || `${seasonCfg.emoji} ${seasonCfg.nudge}`}
          </p>
        )}
      </div>

      {/* Random picker */}
      <button
        onClick={handleRandomPick}
        className={`w-full py-2.5 rounded-xl border border-dashed border-accent/30
          text-sm text-accent font-medium
          transition-colors cursor-pointer bg-gradient-to-r ${seasonCfg.gradient}
          hover:opacity-80`}
      >
        <Sparkles className="w-3.5 h-3.5 text-sunny inline-block mr-1.5 -mt-0.5" />
        What should we cook? {seasonCfg.emoji}
      </button>

      {/* Search & filter bar */}
      <div className="space-y-3">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search recipes...  (press /)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl
              bg-bg-card border border-border/60
              text-sm text-text placeholder:text-text-muted/40
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40
              transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-text-muted/50 hover:text-text-muted transition-colors
                text-lg leading-none cursor-pointer"
            >
              &times;
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(statusFilter === f.value ? 'all' : f.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                ${
                  statusFilter === f.value
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-bg-card text-text-muted border border-border/60 hover:border-accent/30 hover:text-text'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
              ${
                categoryFilter === 'all'
                  ? 'bg-sunny text-white shadow-sm'
                  : 'bg-bg-card text-text-muted border border-border/60 hover:border-sunny/30 hover:text-text'
              }`}
          >
            All categories
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(categoryFilter === c.value ? 'all' : c.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
                ${
                  categoryFilter === c.value
                    ? 'bg-sunny text-white shadow-sm'
                    : 'bg-bg-card text-text-muted border border-border/60 hover:border-sunny/30 hover:text-text'
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[11px] text-text-muted/50 uppercase tracking-wider">Sort</span>
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSortBy(s.value)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer
                ${
                  sortBy === s.value
                    ? 'bg-text/10 text-text'
                    : 'text-text-muted/50 hover:text-text-muted'
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((recipe, i) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              image={firstImages[recipe.id]}
              rotation={CARD_ROTATIONS[i % CARD_ROTATIONS.length]}
              status={statuses?.[recipe.id]}
              isRecipeOfTheWeek={recipe.id === recipeOfTheWeekId}
            />
          ))}
        </div>
      ) : hasActiveFilters ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-text-muted text-lg font-display">No matches</p>
          <p className="text-text-muted/60 text-sm">
            Try a different search or filter.
          </p>
          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('all')
              setCategoryFilter('all')
            }}
            className="text-accent text-sm font-medium hover:underline mt-2 cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  )
}
