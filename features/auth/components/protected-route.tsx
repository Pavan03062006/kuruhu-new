'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => { if (!loading && !user) router.replace('/auth/') }, [loading, router, user])
  if (loading || !user) return <div className="min-h-screen bg-canvas" aria-label="Checking session" />
  return children
}
