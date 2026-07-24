'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, setStoredUser, type AuthUser, type UserRole } from '@/features/auth/api/auth-api'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: typeof authApi.login
  signup: typeof authApi.signup
  logout: () => Promise<void>
  updateProfile: (updated: Partial<AuthUser>) => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  const login = async (payload: Parameters<typeof authApi.login>[0]) => {
    const authenticated = await authApi.login(payload)
    setUser(authenticated)
    return authenticated
  }

  const signup = async (payload: Parameters<typeof authApi.signup>[0]) => {
    const result = await authApi.signup(payload)
    if (result.user) setUser(result.user)
    return result
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  const updateProfile = (updated: Partial<AuthUser>) => {
    if (!user) return
    const newUser = { ...user, ...updated }
    setUser(newUser)
    setStoredUser(newUser)
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    hasPermission: (permission: string) => user?.permissions.includes(permission) ?? false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
