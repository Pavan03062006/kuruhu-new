import type { Metadata } from 'next'
import { AuthFlow } from '@/features/auth/components/auth-flow'

export const metadata: Metadata = { title: 'Sign in' }

export default function AuthPage() {
  return <AuthFlow />
}
