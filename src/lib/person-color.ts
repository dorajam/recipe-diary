import type { Profile } from './types'

// Map known accounts to the Trattoria palette. Falls back to the DB
// accent_colour for any unknown profile.
const PERSON_COLORS: Record<string, string> = {
  'athenafung25@gmail.com':       'var(--color-rose)',
  'sabrinaeandrenacci@gmail.com': 'var(--color-olive)',
}

const NICKNAMES: Record<string, string> = {
  'athenafung25@gmail.com':       'Feeny',
  'sabrinaeandrenacci@gmail.com': 'Beeny',
}

export function personColor(profile: Profile): string {
  return PERSON_COLORS[profile.email] ?? profile.accent_colour
}

export function nicknameFor(profile: Profile): string {
  return NICKNAMES[profile.email] ?? profile.display_name.split(' ')[0]
}
