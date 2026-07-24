'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, MapPin, Network, Phone, ShieldAlert } from 'lucide-react'
import { fetchPersons, fetchFirs } from '@/services/api-client'
import type { Person, Fir } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function PersonProfile({ personId }: { personId: string }) {
  const [person, setPerson] = useState<Person | null>(null)
  const [firs, setFirs] = useState<Fir[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchPersons().catch(() => []),
      fetchFirs().catch(() => []),
    ]).then(([pList, fList]) => {
      const found = pList.find(p => p.id === personId || p.id === String(personId))
      setPerson(found || pList[0] || null)
      setFirs(fList)
    }).finally(() => setLoading(false))
  }, [personId])

  if (loading) {
    return <div className="p-8 text-sm font-semibold text-slate-500">Loading person intelligence from Supabase DB...</div>
  }

  if (!person) {
    return <div className="p-8 text-sm text-red-600">Person profile not found in Supabase database.</div>
  }

  const linkedFirs = firs.filter(f => person.firIds.includes(f.id) || f.personIds.includes(person.id))

  return (
    <>
      <Link href="/workspace/persons" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors hover:text-ink">
        <ArrowLeft className="size-3.5" aria-hidden /> Person Directory
      </Link>

      <div className="mt-4 rounded-xl border border-line bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-steel text-xl font-bold text-white">
              {person.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink">{person.name}</h1>
              <p className="mt-0.5 text-sm text-ink-muted">
                <span className="capitalize">{person.role}</span> · {person.age} yrs · {person.gender === 'F' ? 'Female' : 'Male'} · {person.identifier}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {person.aliases.length > 0
                  ? person.aliases.map(a => <span key={a} className="rounded-full bg-canvas px-2.5 py-0.5 text-xs font-medium text-ink ring-1 ring-inset ring-line">alias: {a}</span>)
                  : <span className="text-xs text-ink-muted">No known aliases</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ring-1 ring-inset', person.risk === 'high' ? 'bg-red-50 text-red-700 ring-red-200' : person.risk === 'medium' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100 text-slate-600 ring-slate-200')}>
              {person.risk === 'high' && <ShieldAlert className="size-3" aria-hidden />} {person.risk} risk
            </span>
            <Link href="/workspace/graph" className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-navy-700">
              <Network className="size-4 text-cyan" aria-hidden /> Open Evidence Graph
            </Link>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm md:grid-cols-4">
          <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Phone</dt><dd className="mt-0.5 flex items-center gap-1.5 font-medium text-ink"><Phone className="size-3.5 text-slate-400" aria-hidden />{person.phone}</dd></div>
          <div className="col-span-2"><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Address</dt><dd className="mt-0.5 font-medium text-ink">{person.address}</dd></div>
          <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Linked FIRs</dt><dd className="mt-0.5 font-medium text-ink">{linkedFirs.length} case(s)</dd></div>
        </dl>
      </div>

      <div className="mt-6 space-y-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Linked First Information Reports</h2>
        {linkedFirs.length === 0 && <p className="text-xs text-ink-muted">No associated FIRs linked in Supabase database.</p>}
        {linkedFirs.map(f => (
          <Link key={f.id} href={`/workspace/firs/${f.id}`} className="block rounded-xl border border-line bg-surface p-4 shadow-sm hover:border-teal-300">
            <span className="font-mono text-xs font-bold text-steel">FIR {f.number}</span>
            <h3 className="mt-1 text-sm font-semibold text-ink">{f.title}</h3>
            <p className="mt-1 text-xs text-slate-600">{f.summary}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
