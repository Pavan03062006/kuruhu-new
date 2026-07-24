import type { ReactNode } from 'react'
import { ApplicationShell } from '@/components/layout/application-shell'
import { ProtectedRoute } from '@/features/auth/components/protected-route'

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute><ApplicationShell>{children}</ApplicationShell></ProtectedRoute>
}
