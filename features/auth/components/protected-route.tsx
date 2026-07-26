'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/'
      }
    }
  }, [loading, user])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center text-sm font-medium text-slate-500">
        <div className="space-y-2">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          <p>Verifying active session...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
