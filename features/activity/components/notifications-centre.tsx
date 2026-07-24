'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Bell, CalendarClock, Check, Info, Sparkles, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/kuruhu/page-header'
import { fetchNotifications } from '@/services/api-client'
import { relativeTime, type AppNotification } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const KIND_META: Record<AppNotification['kind'], { icon: typeof Bell; cls: string }> = {
  verification: { icon: Sparkles, cls: 'bg-navy text-cyan' },
  deadline: { icon: CalendarClock, cls: 'bg-amber-100 text-amber-700' },
  assignment: { icon: UserPlus, cls: 'bg-sky-100 text-sky-700' },
  system: { icon: Info, cls: 'bg-slate-100 text-slate-600' },
  escalation: { icon: AlertTriangle, cls: 'bg-red-100 text-red-700' },
}

export function NotificationsCentre() {
  const [items, setItems] = useState<AppNotification[]>([])
  const [tab, setTab] = useState<'all' | 'action'>('all')

  useEffect(() => {
    fetchNotifications()
      .then(setItems)
      .catch(() => {})
  }, [])

  const shown = items.filter(n => (tab === 'action' ? n.actionRequired : true))
  const markAllRead = () => setItems(list => list.map(n => ({ ...n, read: true })))

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Action-required alerts and operational updates from Supabase database."
        actions={
          <button onClick={markAllRead} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-canvas">
            <Check className="size-4" aria-hidden /> Mark all read
          </button>
        }
      />

      <div className="flex gap-1.5" role="tablist" aria-label="Notification filters">
        {([['all', 'All'], ['action', 'Action required']] as const).map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={cn('rounded-full px-4 py-1.5 text-xs font-semibold transition-colors', tab === key ? 'bg-navy text-white' : 'bg-white text-ink-muted ring-1 ring-inset ring-line hover:text-ink')}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {shown.length === 0 && (
          <div className="rounded-xl border border-dashed border-line bg-surface p-12 text-center">
            <Bell className="mx-auto size-6 text-slate-300" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-ink">Nothing here</p>
            <p className="mt-1 text-xs text-ink-muted">No notifications match this filter.</p>
          </div>
        )}
        {shown.map(n => {
          const meta = KIND_META[n.kind] || KIND_META.system
          return (
            <article key={n.id} className={cn('flex items-start gap-4 rounded-xl border p-4 shadow-sm transition-colors', n.read ? 'border-line bg-surface' : 'border-teal-200 bg-teal-50/40')}>
              <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg', meta.cls)}>
                <meta.icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-ink">{n.title}</h2>
                  {n.actionRequired && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700 ring-1 ring-inset ring-red-200">Action required</span>}
                  {!n.read && <span className="size-1.5 rounded-full bg-teal-500" aria-label="Unread" />}
                  <span className="ml-auto text-xs text-ink-muted">{relativeTime(n.time)}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{n.body}</p>
                {!n.read && (
                  <button onClick={() => setItems(list => list.map(x => (x.id === n.id ? { ...x, read: true } : x)))} className="mt-2 text-xs font-semibold text-teal-700 hover:text-teal-800">
                    Mark as read
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
