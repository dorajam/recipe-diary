import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isAllowed: boolean | null // null = still checking
  loading: boolean
  signInWithEmail: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        checkAllowedAndLoadProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session?.user) {
          checkAllowedAndLoadProfile(session.user)
        } else {
          setProfile(null)
          setIsAllowed(null)
          setLoading(false)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  async function checkAllowedAndLoadProfile(user: User) {
    setLoading(true)

    // Check allow list
    const { data: allowedRow } = await supabase
      .from('allowed_emails')
      .select('email')
      .eq('email', user.email!)
      .maybeSingle()

    if (!allowedRow) {
      setIsAllowed(false)
      setLoading(false)
      return
    }

    setIsAllowed(true)

    // Upsert profile (create on first sign-in)
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      ''

    const avatarUrl = user.user_metadata?.avatar_url || null

    // Try to load existing profile first
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (existing) {
      setProfile(existing as Profile)
    } else {
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          display_name: displayName,
          avatar_url: avatarUrl,
        })
        .select()
        .single()

      if (insertError) {
        // Race condition — another call already inserted, just fetch it
        const { data: refetched } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(refetched as Profile)
      } else {
        setProfile(created as Profile)
      }
    }

    setLoading(false)
  }

  async function signInWithEmail(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setIsAllowed(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        profile,
        session,
        isAllowed,
        loading,
        signInWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
