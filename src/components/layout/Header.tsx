import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { useRecipes } from '../../hooks/use-recipes'

export function Header() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { data: recipes } = useRecipes()

  function handleShuffle() {
    if (!recipes?.length) return
    const pick = recipes[Math.floor(Math.random() * recipes.length)]
    navigate(`/recipes/${pick.id}`)
  }

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
              <span>RECIPES &amp; RAMBLES</span>
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
            {recipes && recipes.length > 1 && (
              <button
                onClick={handleShuffle}
                title="Surprise me"
                aria-label="Surprise me"
                className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10
                  rounded-full bg-bg-card border border-border text-text
                  hover:border-tomato hover:text-tomato cursor-pointer transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

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
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-9 h-9 rounded-full hover:ring-2 hover:ring-tomato/40 transition-all"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-cream font-display italic font-semibold
                      hover:ring-2 hover:ring-tomato/40 transition-all"
                    style={{ backgroundColor: profile.accent_colour }}
                  >
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
