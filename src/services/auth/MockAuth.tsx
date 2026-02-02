// Temporary mock authentication for development
// This bypasses Supabase Auth and uses the seed user IDs directly

import { createContext, useContext, useState, ReactNode } from 'react'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

interface MockAuthContextType {
  user: SupabaseUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

// Use the seed user IDs
const MOCK_USER: SupabaseUser = {
  id: '00000000-0000-0000-0000-000000000101', // Fernando's seed ID
  email: 'fernando@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as SupabaseUser

const MOCK_SESSION: Session = {
  access_token: 'mock-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  refresh_token: 'mock-refresh',
  user: MOCK_USER,
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<SupabaseUser | null>(MOCK_USER)
  const [session] = useState<Session | null>(MOCK_SESSION)
  const [loading] = useState(false)

  const signIn = async () => {
    // Mock sign in - already signed in
  }

  const signUp = async () => {
    // Mock sign up - already signed in
  }

  const signOut = async () => {
    // Mock sign out - do nothing
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>
}

export function useMockAuth() {
  const context = useContext(MockAuthContext)
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider')
  }
  return context
}
