import type { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { isAuthConfigured, supabase } from '../lib/supabaseClient'

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn'

interface AuthStoreValue {
  status: AuthStatus
  user: User | null
  /** Stable per-account UUID from Supabase — the id to key any future DB rows (sessions, payments, ...) off of. */
  userId: string | null
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthStoreContext = createContext<AuthStoreValue | null>(null)

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isAuthConfigured ? 'loading' : 'signedOut')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setStatus(data.session?.user ? 'signedIn' : 'signedOut')
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setStatus(session?.user ? 'signedIn' : 'signedOut')
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: "Login isn't set up yet." }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  // Requires "Confirm email" turned off in Supabase's Auth settings — otherwise signUp
  // succeeds but returns no session until the user clicks a confirmation link.
  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: "Login isn't set up yet." }
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthStoreContext.Provider
      value={{ status, user, userId: user?.id ?? null, configured: isAuthConfigured, signIn, signUp, signOut }}
    >
      {children}
    </AuthStoreContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthStoreContext)
  if (!ctx) throw new Error('useAuth must be used within AuthStoreProvider')
  return ctx
}
