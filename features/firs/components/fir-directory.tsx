'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowDownWideNarrow, ArrowUpRight, ArrowUpWideNarrow, Filter, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/kuruhu/page-header'
import { PriorityBadge, StatusBadge } from '@/components/kuruhu/badges'
import { EntityChip } from '@/components/kuruhu/entity-chip'
import { formatDate, formatTime, relativeTime, type Fir, type FirStatus, type Priority } from '@/lib/mock-data'
import { fetchFirs } from '@/services/api-client'
import { cn } from '@/lib/utils'

const STATUSES: (FirStatus | 'all')[] = ['all', 'registered', 'investigating', 'review', 'closed']
const PRIORITIES: (Priority | 'all')[] = ['all', 'critical', 'high', 'medium', 'low']

export function FirDirectory() {
  const [firs, setFirs] = useState<Fir[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<FirStatus | 'all'>('all')
  const [priority, setPriority] = useState<Priority | 'all'>('all')
  const [station, setStation] = useState<string>('all')
  const [sortDesc, setSortDesc] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetchFirs()
      .then(setFirs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stations = useMemo(() => ['all', ...Array.from(new Set(firs.map(f => f.station)))], [firs])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = firs.filter(f => {
      if (status !== 'all' && f.status !== status) return false
      if (priority !== 'all' && f.priority !== priority) return false
      if (station !== 'all' && f.station !== station) return false
      if (!q) return true
      const hay = `${f.number} ${f.title} ${f.summary} ${f.station} ${f.officer} ${f.sections.join(' ')}`.toLowerCase()
      return hay.includes(q)
    })
    return list.sort((a, b) =>
      sortDesc
        ? +new Date(b.registeredAt) - +new Date(a.registeredAt)
        : +new Date(a.registeredAt) - +new Date(b.registeredAt)
    )
  }, [firs, query, status, priority, station, sortDesc])

  const selected: Fir | undefined = results.find(f => f.id === selectedId) ?? results[0]

  return (
    <>
      <PageHeader
        title="FIR Directory"
        description="Search, filter, and open first information reports across your division."
        actions={
          <Link href="/workspace/firs/new" className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-navy-700">
            <Plus className="size-4" aria-hidden /> Create FIR
          </Link>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3 shadow-sm">
        <div className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-line bg-canvas px-3">
          <Search className="size-4 text-slate-400" aria-hidden />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="FIR number, title, section, officer…"
            className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            aria-label="Search FIRs"
          />
        </div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          <Filter className="size-3.5" aria-hidden /> Status
          <select value={status} onChange={e => setStatus(e.target.value as FirStatus | 'all')} className="h-9 rounded-lg border border-line bg-white px-2 text-[13px] font-medium text-ink">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All' : s}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          Priority
          <select value={priority} onChange={e => setPriority(e.target.value as Priority | 'all')} className="h-9 rounded-lg border border-line bg-white px-2 text-[13px] font-medium text-ink">
            {PRIORITIES.map(p => <option key={p} value={p}>{p === 'all' ? 'All' : p}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          Station
          <select value={station} onChange={e => setStation(e.target.value)} className="h-9 max-w-44 rounded-lg border border-line bg-white px-2 text-[13px] font-medium text-ink">
            {stations.map(s => <option key={s} value={s}>{s === 'all' ? 'All stations' : s}</option>)}
          </select>
        </label>
        <button
          onClick={() => setSortDesc(d => !d)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
          aria-label={`Sort by date, currently ${sortDesc ? 'newest first' : 'oldest first'}`}
        >
          {sortDesc ? <ArrowDownWideNarrow className="size-4" aria-hidden /> : <ArrowUpWideNarrow className="size-4" aria-hidden />}
          {sortDesc ? 'Newest' : 'Oldest'}
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* Results list */}
        <div className="space-y-2.5 lg:col-span-3" role="list" aria-label={`${results.length} FIRs`}>
          <p className="text-xs text-ink-muted">
            {loading ? 'Loading…' : `${results.length} record${results.length === 1 ? '' : 's'}`}
          </p>
          {results.length === 0 && !loading && (
            <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
              <p className="text-sm font-semibold text-ink">No FIRs match the current filters</p>
              <p className="mt-1 text-xs text-ink-muted">Try clearing the search query or widening status and priority.</p>
            </div>
          )}
          {results.map(fir => (
            <button
              key={fir.id}
              role="listitem"
              onClick={() => setSelectedId(fir.id)}
              className={cn(
                'block w-full rounded-xl border p-4 text-left shadow-sm transition-all',
                selected?.id === fir.id
                  ? 'border-teal-400 bg-white ring-1 ring-teal-400'
                  : 'border-line bg-surface hover:-translate-y-0.5 hover:shadow-md',
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-steel">FIR {fir.number}</span>
                <PriorityBadge priority={fir.priority} />
                <StatusBadge status={fir.status} />
                <span className="ml-auto text-[11px] text-ink-muted">{formatDate(fir.registeredAt)}</span>
              </div>
              <h3 className="mt-1.5 text-sm font-semibold text-ink">{fir.title}</h3>
              <p className="mt-1 text-xs text-ink-muted">{fir.station} · {fir.officer} · {fir.sections.join(', ')}</p>
            </button>
          ))}
        </div>

        {/* Preview */}
        <aside className="lg:col-span-2" aria-label="FIR preview">
          {selected && (
            <div className="sticky top-20 rounded-xl border border-line bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-steel">FIR {selected.number}</span>
                <Link href={`/workspace/firs/${selected.id}`} className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-700">
                  Open workspace <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <h3 className="mt-3 text-base font-bold leading-snug text-ink">{selected.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{selected.summary}</p>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Station</dt><dd className="mt-0.5 font-medium text-ink">{selected.station}</dd></div>
                <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Officer</dt><dd className="mt-0.5 font-medium text-ink">{selected.officer}</dd></div>
                <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Priority</dt><dd className="mt-1"><PriorityBadge priority={selected.priority} /></dd></div>
                <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Relationships</dt><dd className="mt-0.5 font-medium tabular text-ink">{selected.relationshipCount} linked</dd></div>
              </dl>

              <div className="mt-4 border-t border-line pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Linked persons</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.personIds.length === 0 && <span className="text-xs text-ink-muted">None linked yet.</span>}
                  {selected.personIds.map(pid => (
                    <EntityChip key={pid} kind="person" label={`Person ${pid}`} href={`/workspace/persons/${pid}`} />
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-line pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Recent timeline</p>
                <ol className="mt-2 space-y-2.5">
                  {selected.timeline.slice(-3).reverse().map(t => (
                    <li key={t.id} className="flex gap-2.5">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
                      <div>
                        <p className="text-[13px] font-medium leading-snug text-ink">{t.title}</p>
                        <p className="text-[11px] text-ink-muted">{formatTime(t.time)} · {t.actor}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-[11px] text-slate-400">Updated {relativeTime(selected.updatedAt)}</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
