'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, Menu, Plus } from 'lucide-react'
import { CommandSearch } from '@/components/kuruhu/command-search'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { NOTIFICATIONS } from '@/lib/mock-data'

interface TopNavigationProps {
  onMenuToggle?: () => void
}

export function TopNavigation({ onMenuToggle }: TopNavigationProps) {
  const { user, logout } = useAuth()
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  const unread = NOTIFICATIONS.filter(n => !n.read).length
  const signOut = async () => { await logout(); window.location.href = '/auth/' }

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
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-line bg-white/90 px-3 backdrop-blur-md sm:gap-3 sm:px-6">
      {/* Mobile Hamburger Menu Toggle */}
      <button
        onClick={onMenuToggle}
        aria-label="Toggle navigation menu"
        className="flex items-center justify-center rounded-lg border border-line p-2 text-slate-700 transition-colors hover:bg-canvas hover:text-navy lg:hidden shrink-0"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile Brand Emblem */}
      <Link href="/workspace/" className="flex items-center gap-2 lg:hidden shrink-0">
        <Image src="/ksp-emblem.png" alt="Karnataka State Police" width={28} height={34} className="object-contain" />
        <span className="font-display text-sm font-bold tracking-wider text-navy hidden sm:inline">PRAMAAN</span>
      </Link>

      <div className="min-w-0 flex-1"><CommandSearch /></div>

      {/* Global Language Selector Pill */}
      <div className="hidden sm:flex items-center rounded-lg border border-line bg-canvas p-1">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
            language === 'en' ? 'bg-navy text-white shadow-sm' : 'text-slate-600 hover:text-navy'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('kn')}
          className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
            language === 'kn' ? 'bg-navy text-cyan shadow-sm' : 'text-slate-600 hover:text-navy'
          }`}
        >
          ಕನ್ನಡ
        </button>
      </div>

      {user?.role !== 'civilian' && (
        <Link
          href="/workspace/firs/new/"
          className="hidden items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-navy-700 md:inline-flex shrink-0"
        >
          <Plus className="size-4" aria-hidden /> {language === 'kn' ? 'ಎಫ್‌ಐಆರ್ ಸೃಷ್ಟಿಸಿ' : 'Create FIR'}
        </Link>
      )}

      <Link href="/workspace/notifications/" aria-label={`Notifications, ${unread} unread`} className="relative rounded-lg border border-line p-2 text-slate-500 transition-colors hover:bg-canvas hover:text-ink shrink-0">
        <Bell className="size-4" aria-hidden />
        {unread > 0 && <span className="absolute -right-1 -top-1 inline-flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{unread}</span>}
      </Link>

      <div className="hidden items-center gap-3 border-l border-line pl-4 sm:flex shrink-0">
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
