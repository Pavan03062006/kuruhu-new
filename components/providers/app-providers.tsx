'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/components/auth-provider'
import { LanguageProvider } from '@/components/providers/language-provider'
import { RouteTransitionProvider } from '@/components/providers/route-transition-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  )
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <RouteTransitionProvider>{children}</RouteTransitionProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
