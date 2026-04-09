import { useAuth } from '../../hooks/use-auth'

export function NotAllowed() {
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl tracking-tight">
            This is a private diary
          </h1>
          <p className="text-text-muted">
            What's Cooking is a personal space for two friends. It's not open for
            new accounts right now.
          </p>
          {user?.email && (
            <p className="text-sm text-text-muted">
              Signed in as {user.email}
            </p>
          )}
        </div>

        <button
          onClick={signOut}
          className="px-5 py-2 rounded-lg border border-border text-sm
            hover:bg-bg-card transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
