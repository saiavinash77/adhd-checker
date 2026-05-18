import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Try to get session, but don't crash if it fails
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.warn('Supabase getSession error:', error.message)
          // Set a flag in localStorage to indicate Supabase is not configured
          if (error.message?.includes('fetch')) {
            localStorage.setItem('supabase_error', 'missing_config')
          }
        }
        setUser(data?.session?.user ?? null)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Auth init error:', err)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
