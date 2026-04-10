export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export function getSeason(): Season {
  const month = new Date().getMonth() // 0-indexed
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

export const SEASON_CONFIG: Record<Season, {
  emoji: string
  gradient: string
  nudge: string
}> = {
  spring: {
    emoji: '\u{1F331}',
    gradient: 'from-green-100 via-yellow-50 to-pink-100',
    nudge: 'Fresh spring flavours!',
  },
  summer: {
    emoji: '\u{2600}\u{FE0F}',
    gradient: 'from-yellow-100 via-orange-50 to-red-100',
    nudge: 'Something light and summery?',
  },
  autumn: {
    emoji: '\u{1F342}',
    gradient: 'from-orange-100 via-amber-50 to-red-100',
    nudge: 'Cosy autumn cooking!',
  },
  winter: {
    emoji: '\u{2744}\u{FE0F}',
    gradient: 'from-blue-100 via-indigo-50 to-purple-100',
    nudge: 'Warm winter comfort food?',
  },
}
