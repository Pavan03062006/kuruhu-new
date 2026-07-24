'use client'

import { useMemo, useState } from 'react'
import { FileText, Package, ScrollText, Search, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/kuruhu/page-header'
import { ACTIVITY, formatTime } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'fir', label: 'FIRs' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'ai-finding', label: 'AI findings' },
] as const

const TYPE_ICON: Record<string, typeof FileText> = { fir: FileText, evidence: Package, 'ai-finding': Sparkles }

export function ActivityTrail() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<string>('all')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ACTIVITY.filter(ev => {
      if (type !== 'all' && ev.targetType !== type) return false
      if (!q) return true
      return `${ev.actor} ${ev.role} ${ev.action} ${ev.target} ${ev.detail}`.toLowerCase().includes(q)
    })
  }, [query, type])

  return (
    <>
      <PageHeader
        title="Activity & Audit Trail"
        description="Every action in KURUHU is permanently logged with actor, time, and context. This trail is searchable and tamper-evident."
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3 shadow-sm">
        <div className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-line bg-canvas px-3">
          <Search className="size-4 text-slate-400" aria-hidden />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by officer, action, FIR number…"
            className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            aria-label="Search audit trail"
          />
        </div>
        <div className="flex gap-1.5" role="radiogroup" aria-label="Filter by record type">
          {TYPES.map(t => (
            <button key={t.key} role="radio" aria-checked={type === t.key} onClick={() => setType(t.key)} className={cn('rounded-full px-3 py-1.5 text-xs font-semibold transition-colors', type === t.key ? 'bg-navy text-white' : 'bg-canvas text-ink-muted ring-1 ring-inset ring-line hover:text-ink')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-surface shadow-sm">
        {results.length === 0 && (
          <div className="p-12 text-center">
            <ScrollText className="mx-auto size-6 text-slate-300" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-ink">No matching audit entries</p>
            <p className="mt-1 text-xs text-ink-muted">Adjust the search query or record-type filter.</p>
          </div>
        )}
        <ol className="divide-y divide-line">
          {results.map(ev => {
            const Icon = TYPE_ICON[ev.targetType] ?? ScrollText
            return (
              <li key={ev.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-canvas/60">
                <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', ev.targetType === 'ai-finding' ? 'bg-navy text-cyan' : 'bg-canvas text-slate-500 ring-1 ring-inset ring-line')}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{ev.actor}</span>
                    <span className="text-ink-muted"> ({ev.role})</span> — {ev.action}: <span className="font-medium">{ev.target}</span>
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">{ev.detail}</p>
                </div>
                <time className="shrink-0 text-xs tabular text-ink-muted">{formatTime(ev.time)}</time>
              </li>
            )
          })}
        </ol>
      </div>
    </>
  )
}
