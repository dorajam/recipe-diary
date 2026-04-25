import type { Profile } from './types'

// Map known accounts to the Trattoria palette. Falls back to the DB
// accent_colour for any unknown profile.
const PERSON_COLORS: Record<string, string> = {
  'athenafung25@gmail.com':       'var(--color-tomato)',
  'sabrinaeandrenacci@gmail.com': 'var(--color-basil)',
}

export function personColor(profile: Profile): string {
  return PERSON_COLORS[profile.email] ?? profile.accent_colour
}
