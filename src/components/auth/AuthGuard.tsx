import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { LoginPage } from './LoginPage'
import { NotAllowed } from './NotAllowed'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isAllowed, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted animate-pulse font-display italic text-2xl">
          La Cucina di Feeny &amp; Beeny
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />
  if (isAllowed === false) return <NotAllowed />

  return <>{children}</>
}
