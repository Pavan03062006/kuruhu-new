'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Activity as ActivityIcon, AlertTriangle, ArrowRight, ArrowUpRight, BrainCircuit, FileText, Network,
  Package, Plus, ScrollText, Search, Sparkles, TrendingUp, Users,
} from 'lucide-react'
import { DashboardHeader } from '@/components/kuruhu/dashboard-header'
import { Sparkline } from '@/components/kuruhu/sparkline'
import { PriorityBadge, StatusBadge, VerificationBadge, ConfidenceMeter } from '@/components/kuruhu/badges'
import { EntityChip } from '@/components/kuruhu/entity-chip'
import { relativeTime, type Fir, type Person, type AiFinding, type AppNotification, type Priority } from '@/lib/mock-data'
import { fetchFirs, fetchPersons, fetchAiFindings, fetchNotifications } from '@/services/api-client'
import { cn } from '@/lib/utils'

const QUICK_ACTIONS = [
  { label: 'Create FIR', desc: 'Guided 9-step intake', href: '/workspace/firs/new', icon: Plus },
  { label: 'Search FIR', desc: 'Directory & filters', href: '/workspace/firs', icon: Search },
  { label: 'Open Graph', desc: 'Entity relationships', href: '/workspace/graph', icon: Network },
  { label: 'AI Investigator', desc: 'Ask in plain language', href: '/workspace/ai-investigator', icon: BrainCircuit },
]

const PRIORITY_RAIL: Record<Priority, string> = {
  critical: 'before:bg-red-500',
  high: 'before:bg-amber-500',
  medium: 'before:bg-sky-500',
  low: 'before:bg-slate-300',
}

export default function CommandCentrePage() {
  const [firs, setFirs] = useState<Fir[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [aiFindings, setAiFindings] = useState<AiFinding[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchFirs().catch(() => []),
      fetchPersons().catch(() => []),
      fetchAiFindings().catch(() => []),
      fetchNotifications().catch(() => []),
    ]).then(([firsData, personsData, findingsData, notifsData]) => {
      setFirs(firsData)
      setPersons(personsData)
      setAiFindings(findingsData)
      setNotifications(notifsData)
    }).finally(() => setLoading(false))
  }, [])

  const priorityFirs = firs.filter(f => (f.priority === 'critical' || f.priority === 'high') && f.status !== 'closed')
  const pendingFindings = aiFindings.filter(a => a.status === 'pending')
  const actionable = notifications.filter(n => n.actionRequired && !n.read)

  const METRICS = [
    { label: 'Active FIRs', value: firs.filter(f => f.status !== 'closed').length, icon: FileText, href: '/workspace/firs' },
    { label: 'Pending reviews', value: firs.filter(f => f.status === 'review').length, icon: AlertTriangle, href: '/workspace/firs?status=review' },
    { label: 'Linked persons', value: persons.length, icon: Users, href: '/workspace/persons' },
    { label: 'AI findings to verify', value: pendingFindings.length, icon: Sparkles, href: '/workspace/ai-investigator' },
    { label: 'Priority FIRs', value: priorityFirs.length, icon: AlertTriangle, href: '/workspace/firs?priority=high' },
  ]

  return (
    <>
      <DashboardHeader />

      {/* Metrics */}
      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {METRICS.map(m => (
          <Link key={m.label} href={m.href} className="group rounded-xl border border-line bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{m.label}</span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-canvas text-slate-400 ring-1 ring-inset ring-line transition-colors group-hover:text-teal-600">
                <m.icon className="size-3.5" aria-hidden />
              </span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="font-display text-3xl font-bold tabular tracking-tight text-ink">{loading ? '...' : m.value}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map(a => (
          <Link key={a.label} href={a.href} className="group flex items-center gap-3 rounded-xl border border-line bg-navy p-4 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan"><a.icon className="size-4" aria-hidden /></span>
            <span className="min-w-0">
              <span className="block font-display text-sm font-semibold">{a.label}</span>
              <span className="block truncate text-xs text-slate-400">{a.desc}</span>
            </span>
            <ArrowRight className="ml-auto size-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan" aria-hidden />
          </Link>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Priority panel */}
        <section aria-labelledby="priority-heading" className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 id="priority-heading" className="font-display text-sm font-bold uppercase tracking-wider text-ink">Priority cases (Live from Supabase)</h2>
            <Link href="/workspace/firs" className="text-xs font-semibold text-teal-700 hover:text-teal-800">View all FIRs →</Link>
          </div>
          <div className="mt-3 space-y-3">
            {priorityFirs.map(fir => (
              <Link
                key={fir.id}
                href={`/workspace/firs/${fir.id}`}
                className={cn(
                  'relative block overflow-hidden rounded-xl border border-line bg-surface p-4 pl-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
                  'before:absolute before:inset-y-0 before:left-0 before:w-1', PRIORITY_RAIL[fir.priority],
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-steel">FIR {fir.number}</span>
                  <PriorityBadge priority={fir.priority} />
                  <StatusBadge status={fir.status} />
                  <span className="ml-auto text-xs text-ink-muted">Updated {relativeTime(fir.updatedAt)}</span>
                </div>
                <h3 className="mt-2 font-display text-[15px] font-semibold text-ink">{fir.title}</h3>
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-600">{fir.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="ml-auto text-xs text-ink-muted">{fir.station} · {fir.officer} · {fir.relationshipCount} relationships</span>
                </div>
              </Link>
            ))}
          </div>

          {/* AI verification queue */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">AI verification queue</h2>
            <Link href="/workspace/ai-investigator" className="text-xs font-semibold text-teal-700 hover:text-teal-800">Open AI Investigator →</Link>
          </div>
          <div className="mt-3 space-y-3">
            {pendingFindings.map(f => (
              <div key={f.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-md bg-navy text-cyan"><Sparkles className="size-3.5" aria-hidden /></span>
                  <span className="text-xs font-semibold text-ink-muted">{f.id} · {relativeTime(f.generatedAt)}</span>
                  <VerificationBadge status={f.status} className="ml-auto" />
                </div>
                <p className="mt-2 font-display text-sm font-semibold text-ink">{f.title}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ConfidenceMeter value={f.confidence} />
                    <span className="text-xs text-ink-muted">{f.citations.length} citations</span>
                  </div>
                  <Link
                    href="/workspace/ai-investigator"
                    className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-navy-700"
                  >
                    Review & verify <ArrowUpRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right rail */}
        <section aria-label="Notifications and alerts" className="space-y-6">
          <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Action required</h2>
              <Link href="/workspace/notifications" className="text-xs font-semibold text-teal-700 hover:text-teal-800">All →</Link>
            </div>
            <div className="mt-3 space-y-3">
              {actionable.length === 0 && <p className="py-4 text-center text-xs text-ink-muted">No pending actions.</p>}
              {actionable.map(n => (
                <Link key={n.id} href="/workspace/notifications" className="block rounded-lg border border-line bg-canvas p-3 transition-colors hover:border-teal-300">
                  <p className="text-[13px] font-semibold leading-snug text-ink">{n.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{n.body}</p>
                  <p className="mt-1.5 text-[11px] text-slate-400">{relativeTime(n.time)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
