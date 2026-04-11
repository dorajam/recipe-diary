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
    <header className="border-b border-border bg-bg/90 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
        <Link to="/" className="no-underline group cursor-pointer shrink-0">
          <div className="relative">
            <h1 className="text-lg sm:text-xl tracking-tight text-text m-0 leading-tight">
              What's <span className="text-accent">Cooking</span>
              <span className="block text-[11px] sm:text-xs text-text-muted/60 font-normal tracking-normal">
                with Feeny & Beeny
              </span>
            </h1>
            <svg className="absolute -bottom-1 left-0 w-full h-[6px]" viewBox="0 0 100 6" preserveAspectRatio="none" fill="none">
              <path d="M0 4 Q25 0 50 3 Q75 6 100 2" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
            </svg>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {recipes && recipes.length > 1 && (
            <button
              onClick={handleShuffle}
              title="Surprise me"
              className="inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto
                sm:gap-1.5 sm:px-3.5 sm:py-2 rounded-full
                text-sm text-text-muted hover:text-accent hover:bg-accent-soft/50
                transition-colors cursor-pointer bg-transparent border border-border/60
                hover:border-accent/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Surprise me</span>
            </button>
          )}

          <Link
            to="/recipes/new"
            className="inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto
              sm:gap-1.5 sm:px-5 sm:py-2.5 rounded-full
              bg-accent text-white text-sm font-medium no-underline
              hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            <span className="hidden sm:inline">Add Recipe</span>
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
                  className="w-8 h-8 rounded-full hover:ring-2 hover:ring-accent/30 transition-all"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
                    hover:ring-2 hover:ring-accent/30 transition-all"
                  style={{ backgroundColor: profile.accent_colour }}
                >
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
