'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/kuruhu/page-header'
import { relativeTime, type Person, type PersonRole } from '@/lib/mock-data'
import { fetchPersons } from '@/services/api-client'
import { cn } from '@/lib/utils'

import { useLanguage } from '@/components/providers/language-provider'

const ROLES: (PersonRole | 'all')[] = ['all', 'accused', 'suspect', 'complainant', 'witness', 'victim']

const ROLE_KN: Record<string, string> = {
  all: 'ಎಲ್ಲಾ',
  accused: 'ಆರೋಪಿ',
  suspect: 'ಶಂಕಿತ',
  complainant: 'ದೂರುದಾರ',
  witness: 'ಸಾಕ್ಷಿ',
  victim: 'ಸಂತ್ರಸ್ತ',
}

export function PersonDirectory() {
  const { language, t } = useLanguage()
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<PersonRole | 'all'>('all')

  useEffect(() => {
    fetchPersons()
      .then(setPersons)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return persons.filter(p => {
      if (role !== 'all' && p.role !== role) return false
      if (!q) return true
      const hay = `${p.name} ${p.aliases.join(' ')} ${p.phone} ${p.identifier} ${p.address}`.toLowerCase()
      return hay.includes(q)
    })
  }, [persons, query, role])

  return (
    <>
      <PageHeader
        title={t('person.title', 'Person Intelligence')}
        description={t('person.desc', 'Search people across investigations by name, alias, phone, or identifier.')}
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3 shadow-sm">
        <div className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-line bg-canvas px-3">
          <Search className="size-4 text-slate-400" aria-hidden />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('person.searchPlaceholder', 'Name, alias, phone, identifier…')}
            className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            aria-label="Search persons"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Filter by role">
          {ROLES.map(r => (
            <button
              key={r}
              role="radio"
              aria-checked={role === r}
              onClick={() => setRole(r)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                role === r ? 'bg-navy text-white' : 'bg-canvas text-ink-muted ring-1 ring-inset ring-line hover:text-ink'
              )}
            >
              {language === 'kn' ? (ROLE_KN[r] || r) : r}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-muted">
        {loading ? 'Loading…' : `${results.length} person${results.length === 1 ? '' : 's'}`}
      </p>

      <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {results.length === 0 && !loading && (
          <div className="col-span-full rounded-xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="text-sm font-semibold text-ink">No matching persons</p>
            <p className="mt-1 text-xs text-ink-muted">Try an alias, partial phone number, or clear the role filter.</p>
          </div>
        )}
        {results.map(p => (
          <Link key={p.id} href={`/workspace/persons/${p.id}`} className="rounded-xl border border-line bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-steel text-sm font-bold text-white">
                {p.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                <p className="truncate text-xs text-ink-muted">
                  {p.aliases.length > 0 ? `Alias: ${p.aliases.join(', ')}` : 'No known aliases'}
                </p>
              </div>
              <span className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset',
                p.risk === 'high' ? 'bg-red-50 text-red-700 ring-red-200'
                  : p.risk === 'medium' ? 'bg-amber-50 text-amber-700 ring-amber-200'
                  : 'bg-slate-100 text-slate-600 ring-slate-200'
              )}>{p.risk}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-muted">
              <span className="capitalize">{p.role} · {p.firIds.length} FIR{p.firIds.length === 1 ? '' : 's'} · {p.relationships.length} link{p.relationships.length === 1 ? '' : 's'}</span>
              <span>{relativeTime(p.lastActivity)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
