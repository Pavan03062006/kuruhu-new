'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  Bell,
  BrainCircuit,
  FileText,
  LayoutGrid,
  Network,
  Settings,
  Users,
  ShieldCheck,
  ShieldAlert,
  User,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { NOTIFICATIONS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const unread = NOTIFICATIONS.filter(n => !n.read).length

  const role = user?.role || 'officer'

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    if (mobileOpen && onClose) {
      onClose()
    }
  }, [pathname])

  const signOut = async () => {
    if (onClose) onClose()
    await logout()
    router.replace('/')
  }

  const NAV = [
    { label: t('nav.dashboard', 'Dashboard'), href: '/workspace', icon: LayoutGrid, exact: true, roles: ['admin', 'officer', 'civilian'] },
    { label: t('nav.firs', 'FIR Directory'), href: '/workspace/firs', icon: FileText, roles: ['admin', 'officer', 'civilian'] },
    { label: t('nav.persons', 'Person Intelligence'), href: '/workspace/persons', icon: Users, roles: ['admin', 'officer'] },
    { label: t('nav.graph', 'Evidence Graph'), href: '/workspace/graph', icon: Network, roles: ['admin', 'officer'] },
    { label: t('nav.ai', 'AI Investigator'), href: '/workspace/ai-investigator', icon: BrainCircuit, roles: ['admin', 'officer'] },
    { label: t('nav.activity', 'Audit & Activity'), href: '/workspace/activity', icon: Activity, roles: ['admin', 'officer'] },
    { label: t('nav.notifications', 'Notifications'), href: '/workspace/notifications', icon: Bell, roles: ['admin', 'officer', 'civilian'] },
    { label: t('nav.settings', 'Settings'), href: '/workspace/settings', icon: Settings, roles: ['admin', 'officer', 'civilian'] },
  ].filter(item => item.roles.includes(role))

  const navContent = (
    <>
      <div className="px-3 pt-4">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-3 text-xs text-white/90">
          {role === 'admin' ? (
            <ShieldAlert className="size-5 shrink-0 text-amber-400" />
          ) : role === 'civilian' ? (
            <User className="size-5 shrink-0 text-cyan" />
          ) : (
            <ShieldCheck className="size-5 shrink-0 text-teal-400" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold leading-none">{user?.display_name || 'Authenticated User'}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{role}</p>
          </div>
        </div>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                active ? 'bg-white/[0.08] text-white font-semibold' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-cyan" aria-hidden />}
              <Icon className={cn('size-4 shrink-0', active ? 'text-cyan' : 'text-slate-400')} aria-hidden />
              <span className="truncate">{item.label}</span>
              {(item.href === '/workspace/notifications' || item.label === 'Notifications' || item.label === 'ಸೂಚನೆಗಳು') && unread > 0 && (
                <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-cyan px-1.5 py-0.5 text-[10px] font-bold text-navy">{unread}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Language Switcher in Drawer */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Language / ಭಾಷೆ</span>
          <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setLanguage('en')}
              className={cn('px-2.5 py-1 text-xs font-semibold rounded-md transition-colors', language === 'en' ? 'bg-cyan text-navy shadow-sm' : 'text-slate-400 hover:text-white')}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('kn')}
              className={cn('px-2.5 py-1 text-xs font-semibold rounded-md transition-colors', language === 'kn' ? 'bg-cyan text-navy shadow-sm' : 'text-slate-400 hover:text-white')}
            >
              ಕನ್ನಡ
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-[11px] leading-4 text-slate-500">
          {language === 'kn' ? 'ಸೂಪರ್‌ಬೇಸ್ ಡಿಬಿ ಸಂಪರ್ಕಗೊಂಡಿದೆ · ಆಡಿಟ್ ಪಟ್ಟಿ ಉಳಿಸಲಾಗಿದೆ' : 'Connected to Supabase DB · Session logged to audit trail.'}
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden h-screen sticky top-0 w-60 shrink-0 flex-col border-r border-white/10 bg-navy lg:flex" aria-label="Investigation navigation">
        <Link href="/workspace" className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <Image src="/ksp-emblem.png" alt="Karnataka State Police" width={36} height={43} className="object-contain" />
          <div>
            <div className="text-base font-bold tracking-[0.18em] text-white">PRAMAAN</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              {language === 'kn' ? 'ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ಪೋರ್ಟಲ್' : role === 'admin' ? 'Admin Governance' : role === 'civilian' ? 'Citizen Portal' : 'Police Intelligence'}
            </div>
          </div>
        </Link>
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden
        />

        {/* Sliding Panel */}
        <aside
          className={cn(
            'absolute left-0 top-0 bottom-0 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-navy shadow-2xl transition-transform duration-300 ease-in-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          aria-label="Mobile navigation drawer"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <Link href="/workspace" onClick={onClose} className="flex items-center gap-3">
              <Image src="/ksp-emblem.png" alt="Karnataka State Police" width={32} height={38} className="object-contain" />
              <div>
                <div className="text-base font-bold tracking-[0.18em] text-white">PRAMAAN</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  {language === 'kn' ? 'ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ಪೋರ್ಟಲ್' : role === 'admin' ? 'Admin Governance' : role === 'civilian' ? 'Citizen Portal' : 'Police Intelligence'}
                </div>
              </div>
            </Link>
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {navContent}

          <div className="border-t border-white/10 px-4 py-3">
            <button
              onClick={signOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
            >
              <LogOut className="size-4" /> Sign Out
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
