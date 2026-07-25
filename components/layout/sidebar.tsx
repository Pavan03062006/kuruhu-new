'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Bell, BrainCircuit, FileText, LayoutGrid, Network, Settings, Users, ShieldCheck, ShieldAlert, User } from 'lucide-react'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { NOTIFICATIONS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const unread = NOTIFICATIONS.filter(n => !n.read).length

  const role = user?.role || 'officer'

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

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-navy lg:flex" aria-label="Investigation navigation">
      <Link href="/workspace" className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <Image src="/ksp-emblem.png" alt="Karnataka State Police" width={36} height={43} className="object-contain" />
        <div>
          <div className="text-base font-bold tracking-[0.18em] text-white">PRAMAAN</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            {language === 'kn' ? 'ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ಪೋರ್ಟಲ್' : role === 'admin' ? 'Admin Governance' : role === 'civilian' ? 'Citizen Portal' : 'Police Intelligence'}
          </div>
        </div>
      </Link>

      <div className="px-3 pt-4">
        <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2.5 text-xs text-white/90">
          {role === 'admin' ? <ShieldAlert className="size-4 text-amber-400" /> : role === 'civilian' ? <User className="size-4 text-cyan" /> : <ShieldCheck className="size-4 text-teal-400" />}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold leading-none">{user?.display_name || 'Authenticated User'}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{role}</p>
          </div>
        </div>
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                active ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-cyan" aria-hidden />}
              <Icon className={cn('size-4', active && 'text-cyan')} aria-hidden />
              {item.label}
              {(item.href === '/workspace/notifications' || item.label === 'Notifications' || item.label === 'ಸೂಚನೆಗಳು') && unread > 0 && (
                <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-cyan px-1.5 py-0.5 text-[10px] font-bold text-navy">{unread}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-[11px] leading-4 text-slate-500">
          {language === 'kn' ? 'ಸೂಪರ್‌ಬೇಸ್ ಡಿಬಿ ಸಂಪರ್ಕಗೊಂಡಿದೆ · ಆಡಿಟ್ ಪಟ್ಟಿ ಉಳಿಸಲಾಗಿದೆ' : 'Connected to Supabase DB · Session logged to audit trail.'}
        </p>
      </div>
    </aside>
  )
}
