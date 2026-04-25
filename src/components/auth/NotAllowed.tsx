import { useAuth } from '../../hooks/use-auth'
import { Pepper } from '../illustrations/Produce'

export function NotAllowed() {
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <Pepper size={64} className="mx-auto" />

        <div className="space-y-3">
          <div
            className="font-mono font-bold"
            style={{
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'var(--color-tomato)',
            }}
          >
            CHIUSO · PRIVATE
          </div>

          <h1
            className="m-0 font-display italic font-medium leading-[1] tracking-tight text-text"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}
          >
            This is a private diary.
          </h1>

          <p className="font-display italic text-text-muted text-base m-0 leading-relaxed">
            La Cucina di Feeny &amp; Beeny is a personal space for two friends.
            It's not open for new accounts right now.
          </p>

          {user?.email && (
            <p
              className="font-mono text-text-muted m-0 mt-4"
              style={{ fontSize: 11, letterSpacing: '0.12em' }}
            >
              SIGNED IN AS{' '}
              <span className="not-italic font-bold">{user.email}</span>
            </p>
          )}
        </div>

        <button onClick={signOut} className="btn-trat btn-trat-ghost mx-auto">
          sign out
        </button>
      </div>
    </div>
  )
}
