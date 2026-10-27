import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthState, User } from '@/types'

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  })

  const login = useCallback(async (email: string, _password: string) => {
    setAuthState({ user: null, isAuthenticated: false, isLoading: true })
    // Mock auth - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 500))
    const user: User = {
      id: 'usr_' + Date.now(),
      email,
      displayName: email.split('@')[0],
      firstName: email.split('@')[0].split('.')[0],
      initials: email.substring(0, 2).toUpperCase(),
      role: 'owner',
    }
    setAuthState({ user, isAuthenticated: true, isLoading: false })
    localStorage.setItem('lumini_auth', JSON.stringify(user))
  }, [])

  const signup = useCallback(async (email: string, _password: string, displayName: string) => {
    setAuthState({ user: null, isAuthenticated: false, isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 500))
    const user: User = {
      id: 'usr_' + Date.now(),
      email,
      displayName,
      firstName: displayName.split(' ')[0],
      initials: displayName.substring(0, 2).toUpperCase(),
      role: 'owner',
    }
    setAuthState({ user, isAuthenticated: true, isLoading: false })
    localStorage.setItem('lumini_auth', JSON.stringify(user))
  }, [])

  const logout = useCallback(() => {
    setAuthState({ user: null, isAuthenticated: false, isLoading: false })
    localStorage.removeItem('lumini_auth')
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setAuthState(prev => {
      if (!prev.user) return prev
      const updated = { ...prev.user, ...updates }
      localStorage.setItem('lumini_auth', JSON.stringify(updated))
      return { ...prev, user: updated }
    })
  }, [])

  // Restore session from localStorage
  useState(() => {
    try {
      const stored = localStorage.getItem('lumini_auth')
      if (stored) {
        const user = JSON.parse(stored)
        setAuthState({ user, isAuthenticated: true, isLoading: false })
      }
    } catch {}
  })

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
