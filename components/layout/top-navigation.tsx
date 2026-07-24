'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, Plus } from 'lucide-react'
import { CommandSearch } from '@/components/kuruhu/command-search'
import { useAuth } from '@/features/auth/components/auth-provider'
import { NOTIFICATIONS } from '@/lib/mock-data'

export function TopNavigation() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const unread = NOTIFICATIONS.filter(n => !n.read).length
  const signOut = async () => { await logout(); router.replace('/') }

  const displayName = user?.display_name || 'Investigating Officer'
  const userRoleLabel = user?.role === 'admin' ? 'System Admin' : user?.role === 'civilian' ? 'Citizen' : 'Investigating Officer'
  const userStation = user?.station || user?.district || 'Bengaluru'

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'US'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-line bg-white/90 px-4 backdrop-blur-md md:px-6">
      <div className="min-w-0 flex-1"><CommandSearch /></div>

      {user?.role !== 'civilian' && (
        <Link
          href="/workspace/firs/new"
          className="hidden items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-navy-700 md:inline-flex"
        >
          <Plus className="size-4" aria-hidden /> Create FIR
        </Link>
      )}

      <Link href="/workspace/notifications" aria-label={`Notifications, ${unread} unread`} className="relative rounded-lg border border-line p-2 text-slate-500 transition-colors hover:bg-canvas hover:text-ink">
        <Bell className="size-4" aria-hidden />
        {unread > 0 && <span className="absolute -right-1 -top-1 inline-flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{unread}</span>}
      </Link>

      <div className="hidden items-center gap-3 border-l border-line pl-4 sm:flex">
        <div className="flex size-8 items-center justify-center rounded-full bg-steel text-xs font-bold text-white" aria-hidden>{initials}</div>
        <div className="hidden lg:block">
          <p className="text-[13px] font-semibold leading-4 text-ink">{displayName}</p>
          <p className="text-[11px] leading-4 text-ink-muted">{userRoleLabel} · {userStation}</p>
        </div>
        <button onClick={signOut} aria-label="Sign out" className="rounded-lg border border-line p-2 text-slate-500 transition-colors hover:bg-canvas hover:text-ink">
          <LogOut className="size-4" aria-hidden />
        </button>
      </div>
    </header>
  )
}
