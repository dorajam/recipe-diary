import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { personColor } from '../../lib/person-color'

function initialsFor(displayName: string): string {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function Header() {
  const { profile, signOut } = useAuth()

  return (
    <header className="border-b-2 border-border bg-bg relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-10 pt-5 sm:pt-7 pb-4 sm:pb-5">
        <div className="flex items-start justify-between gap-4">
          {/* Masthead title */}
          <Link to="/" className="no-underline group cursor-pointer block">
            {/* Eyebrow row */}
            <div className="eyebrow flex items-center gap-2.5 flex-wrap">
              <span>EST. 2011</span>
              <span
                aria-hidden
                className="inline-block w-1 h-1 rounded-full"
                style={{ background: 'var(--color-tomato)' }}
              />
              <span className="hidden sm:inline">HOME COOKING</span>
              <span
                aria-hidden
                className="hidden sm:inline-block w-1 h-1 rounded-full"
                style={{ background: 'var(--color-basil)' }}
              />
              <span>SUNDAYS &amp; WEEKNIGHTS</span>
            </div>

            <h1
              className="m-0 mt-1.5 sm:mt-2 font-display italic font-medium leading-[0.95] tracking-tight text-text"
              style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)' }}
            >
              La{' '}
              <span style={{ color: 'var(--color-tomato)' }}>Cucina</span>
              {' '}di{' '}
              <span style={{ color: 'var(--color-basil)' }}>
                Feeny &amp; Beeny
              </span>
            </h1>

            <p
              className="m-0 mt-2 font-mono text-[10px] text-text-muted font-medium"
              style={{ letterSpacing: '0.18em' }}
            >
              RECIPES &amp; RAMBLES{' '}
              <span style={{ color: 'var(--color-tomato)' }}>·</span>{' '}
              VOL. ONE
            </p>
          </Link>

          {/* Actions column */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 mt-1">
            <Link to="/recipes/new" className="btn-trat">
              <span className="text-lg leading-none">+</span>
              <span className="hidden sm:inline">aggiungi</span>
            </Link>

            {profile && (
              <button
                onClick={signOut}
                title="Sign out"
                className="shrink-0 cursor-pointer bg-transparent border-none p-0"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-cream font-display italic font-semibold text-sm
                    hover:ring-2 hover:ring-tomato/40 transition-all"
                  style={{ backgroundColor: personColor(profile) }}
                >
                  {initialsFor(profile.display_name)}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
