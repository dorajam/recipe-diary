import type { RecipeStatus } from './types'

/**
 * The cookbook pipeline. Every recipe moves through these stages:
 *   saved → planned → cooked → candidate
 * Defined once here; UI (toggles, filters, badges) reads from this.
 */
export interface StageMeta {
  value: RecipeStatus
  label: string       // English primary
  short: string       // compact label for tabs / mobile
  /** a CSS color token from index.css */
  color: string
  hint: string        // one-line meaning, for tooltips / help
}

export const STAGES: StageMeta[] = [
  {
    value: 'saved',
    label: 'Saved',
    short: 'Saved',
    color: 'var(--color-text-muted)',
    hint: 'In the collection, not planned yet.',
  },
  {
    value: 'planned',
    label: 'Planned',
    short: 'Planned',
    color: 'var(--color-ackee)',
    hint: 'On a week’s cook list — I mean to make this.',
  },
  {
    value: 'cooked',
    label: 'Cooked',
    short: 'Cooked',
    color: 'var(--color-basil)',
    hint: 'I’ve made it and logged how it went.',
  },
  {
    value: 'candidate',
    label: 'Book candidate',
    short: 'Candidate',
    color: 'var(--color-tomato)',
    hint: 'Cooked, loved, refined — good enough for the cookbook.',
  },
]

/** Stage order for sorting / progress (0 = earliest). */
export const STAGE_ORDER: Record<RecipeStatus, number> = {
  saved: 0,
  planned: 1,
  cooked: 2,
  candidate: 3,
}

export function stageMeta(status: RecipeStatus | null | undefined): StageMeta | null {
  if (!status) return null
  return STAGES.find((s) => s.value === status) ?? null
}
