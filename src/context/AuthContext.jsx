import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)

    // Listen for storage changes (multi-tab sync)
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser()
      setUser(updatedUser)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
