'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Car, FileText, MapPin, Network, Package, ScrollText, Sparkles, User, Users } from 'lucide-react'
import { PriorityBadge, StatusBadge } from '@/components/kuruhu/badges'
import { EntityChip } from '@/components/kuruhu/entity-chip'
import { fetchFirs, fetchPersons, fetchEvidence } from '@/services/api-client'
import type { Fir, Person, EvidenceItem } from '@/lib/mock-data'
import { formatDate } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function FirWorkspace({ firId }: { firId: string }) {
  const [fir, setFir] = useState<Fir | null>(null)
  const [persons, setPersons] = useState<Person[]>([])
  const [evidence, setEvidence] = useState<EvidenceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchFirs().catch(() => []),
      fetchPersons().catch(() => []),
      fetchEvidence().catch(() => []),
    ]).then(([fList, pList, eList]) => {
      const found = fList.find(f => f.id === firId || f.id === String(firId))
      setFir(found ?? null)
      setPersons(pList)
      setEvidence(eList)
    }).finally(() => setLoading(false))
  }, [firId])

  if (loading) {
    return <div className="p-8 text-sm font-semibold text-slate-500">Loading FIR workspace from Supabase DB...</div>
  }

  if (!fir) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-lg font-bold text-red-800">FIR record not found</h1>
        <p className="mt-2 text-sm text-red-700">No FIR with ID <span className="font-mono font-semibold">{firId}</span> exists in the current database scope.</p>
        <Link href="/workspace/firs/" className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700">
          <ArrowLeft className="size-4" aria-hidden /> Return to FIR Directory
        </Link>
      </div>
    )
  }

  const linkedPersons = persons.filter(p => fir.personIds.includes(p.id) || p.firIds.includes(fir.id))
  const linkedEvidence = evidence.filter(e => e.firId === fir.id)

  return (
    <>
      <div className="mb-5">
        <Link href="/workspace/firs/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors hover:text-ink">
          <ArrowLeft className="size-3.5" aria-hidden /> FIR Directory
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-steel">FIR {fir.number}</span>
              <PriorityBadge priority={fir.priority} />
              <StatusBadge status={fir.status} />
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">{fir.title}</h1>
            <p className="mt-1 text-sm text-ink-muted">{fir.station} · {fir.district} · Registered {formatDate(fir.registeredAt)} · {fir.sections.join(' · ')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/workspace/graph/" className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-canvas">
              <Network className="size-4 text-teal-600" aria-hidden /> View in graph
            </Link>
            <Link href="/workspace/ai-investigator/" className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-navy-700">
              <Sparkles className="size-4 text-cyan" aria-hidden /> Ask AI
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Brief Facts */}
          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Brief Facts & Case Details</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{fir.summary}</p>
          </div>

          {/* Linked Persons */}
          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Accused, Suspects & Complainants</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {linkedPersons.length === 0 && <p className="text-xs text-ink-muted">No persons linked yet.</p>}
              {linkedPersons.map(p => (
                <Link key={p.id} href={`/workspace/persons/${p.id}/`} className="flex items-center gap-3 rounded-lg border border-line bg-canvas p-3 hover:border-teal-300">
                  <span className="flex size-9 items-center justify-center rounded-full bg-steel text-xs font-bold text-white">
                    {p.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.name}</p>
                    <p className="text-xs capitalize text-ink-muted">{p.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Info Rail */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Evidence Items</h2>
            <div className="mt-3 space-y-2">
              {linkedEvidence.length === 0 && <p className="text-xs text-ink-muted">No evidence items linked.</p>}
              {linkedEvidence.map(e => (
                <div key={e.id} className="rounded-lg border border-line bg-canvas p-3">
                  <p className="text-xs font-semibold text-ink">{e.label}</p>
                  <p className="mt-0.5 text-[11px] capitalize text-ink-muted">{e.type} · {e.status}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
