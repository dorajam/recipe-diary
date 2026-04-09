import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { Sparkles } from '../illustrations/Doodles'

export function Header() {
  const { profile, signOut } = useAuth()

  return (
    <header className="border-b border-border bg-bg/90 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="no-underline group cursor-pointer">
          <h1 className="text-xl tracking-tight text-text m-0 flex items-center gap-1.5">
            What's <span className="text-accent">Cooking</span>
            <Sparkles className="w-4 h-4 text-sunny" />
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/recipes/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full
              bg-accent text-white text-sm font-medium no-underline
              hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            Add Recipe
          </Link>

          {profile && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: profile.accent_colour }}
                  >
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={signOut}
                className="text-sm text-text-muted hover:text-text transition-colors cursor-pointer bg-transparent border-none"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
