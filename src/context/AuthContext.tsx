import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { AuthState, User } from '@/types'
import { api } from '@/lib/api/client'

type BackendUser = {
  id: string
  email: string
  displayName: string | null
}

type BackendOrganization = {
  id: string
  name: string
  plan: string
  role: string
}

type SessionResponse = {
  user: BackendUser
  organizations: BackendOrganization[]
}

type AuthResponse = {
  user: BackendUser
  csrfToken: string
}

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function toFrontendUser(
  backendUser: BackendUser,
  organizations: BackendOrganization[] = [],
): User {
  const displayName =
    backendUser.displayName?.trim() || backendUser.email.split('@')[0]

  const firstName =
    displayName.split(/\s+/).filter(Boolean)[0] || displayName

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase() || backendUser.email.slice(0, 2).toUpperCase()

  return {
    id: backendUser.id,
    email: backendUser.email,
    displayName,
    firstName,
    initials,
    role: organizations[0]?.role || undefined,
  }
}

function emptyAuthState(isLoading = false): AuthState {
  return {
    user: null,
    isAuthenticated: false,
    isLoading,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => emptyAuthState(true))

  useEffect(() => {
    let active = true

    async function restoreSession() {
      try {
        await api.get<{ csrfToken: string }>('/auth/csrf')
        const session = await api.get<SessionResponse>('/auth/me')
        if (active) {
          setAuthState({
            user: toFrontendUser(session.user, session.organizations),
            isAuthenticated: true,
            isLoading: false,
          })
          return
        }
      } catch {
        // ignore
      }

      if (active) {
        setAuthState(emptyAuthState(false))
      }
    }

    void restoreSession()

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(previous => ({ ...previous, isLoading: true }))

    try {
      await api.post<AuthResponse>('/auth/login', {
        email: email.trim(),
        password,
      })

      const session = await api.get<SessionResponse>('/auth/me')

      setAuthState({
        user: toFrontendUser(session.user, session.organizations),
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setAuthState(previous => ({
        ...previous,
        isLoading: false,
      }))
      throw error
    }
  }, [])

  const signup = useCallback(async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    setAuthState(previous => ({ ...previous, isLoading: true }))

    try {
      await api.post<AuthResponse>('/auth/register', {
        email: email.trim(),
        password,
        displayName: displayName.trim(),
      })

      const session = await api.get<SessionResponse>('/auth/me')

      setAuthState({
        user: toFrontendUser(session.user, session.organizations),
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setAuthState(previous => ({
        ...previous,
        isLoading: false,
      }))
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post<void>('/auth/logout', {})
    } catch {
      // ignore
    } finally {
      setAuthState(emptyAuthState(false))
    }
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setAuthState(previous => {
      if (!previous.user) return previous
      return {
        ...previous,
        user: { ...previous.user, ...updates },
      }
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...authState, login, signup, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}