'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { RouteLoadingScreen } from '@/components/states/route-loading-screen'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/')
    }
  }, [loading, router, user])

  if (loading || !user) {
    return <RouteLoadingScreen message={loading ? 'Verifying active session…' : 'Redirecting to sign in…'} />
  }

  return <>{children}</>
}
