'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, FileText, MapPin, Search, User, X } from 'lucide-react'
import { fetchFirs, fetchPersons, fetchVehicles } from '@/services/api-client'
import { cn } from '@/lib/utils'

import { useLanguage } from '@/components/providers/language-provider'
import { useRouteTransition } from '@/components/providers/route-transition-provider'

type Result = {
  key: string
  kind: 'FIR' | 'Person' | 'Vehicle' | 'Location'
  title: string
  subtitle: string
  href: string
}

const KIND_ICON = { FIR: FileText, Person: User, Vehicle: Car, Location: MapPin }

export function CommandSearch() {
  const { language, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [index, setIndex] = useState<Result[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { startNavigation } = useRouteTransition()

  useEffect(() => {
    Promise.all([fetchFirs().catch(() => []), fetchPersons().catch(() => []), fetchVehicles().catch(() => [])]).then(
      ([firs, persons, vehicles]) => {
        const items: Result[] = [
          ...firs.map((f) => ({
            key: f.id,
            kind: 'FIR' as const,
            title: `FIR ${f.number} — ${f.title}`,
            subtitle: `${f.station} · ${f.officer}`,
            href: `/workspace/firs/${f.id}/`,
          })),
          ...persons.map((p) => ({
            key: p.id,
            kind: 'Person' as const,
            title: p.name + (p.aliases.length ? ` (${p.aliases.join(', ')})` : ''),
            subtitle: `${p.role} · ${p.address}`,
            href: `/workspace/persons/${p.id}/`,
          })),
          ...vehicles.map((v) => ({
            key: v.id,
            kind: 'Vehicle' as const,
            title: v.registration,
            subtitle: `${v.color} ${v.make}`,
            href: '/workspace/graph/',
          })),
        ]
        setIndex(items)
      },
    )
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return index.slice(0, 7)
    return index.filter((r) => (r.title + ' ' + r.subtitle + ' ' + r.kind).toLowerCase().includes(q)).slice(0, 9)
  }, [query, index])

  const openSearch = () => {
    setQuery('')
    setActive(0)
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 10)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => {
          if (!v) {
            setQuery('')
            setActive(0)
            setTimeout(() => inputRef.current?.focus(), 10)
          }
          return !v
        })
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (r: Result) => {
    setOpen(false)
    startNavigation()
    router.push(r.href)
  }

  return (
    <>
      <button
        onClick={openSearch}
        className="border-line bg-canvas text-ink-muted hover:text-ink flex h-9 w-64 items-center justify-between rounded-lg border px-3 text-xs font-medium transition-colors hover:border-teal-300"
      >
        <span className="flex items-center gap-2">
          <Search className="size-3.5 text-slate-400" aria-hidden />
          <span>{t('header.search', 'Search FIR, person, vehicle...')}</span>
        </span>
        <kbd className="border-line text-ink-muted rounded border bg-white px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>

      {open && (
        <div className="bg-navy/60 fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 backdrop-blur-sm">
          <div className="border-line bg-surface w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl">
            <div className="border-line flex items-center gap-2 border-b px-4 py-3">
              <Search className="size-4 text-slate-400" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                placeholder={language === 'kn' ? 'ಎಫ್‌ಐಆರ್, ಶಂಕಿತರು, ವಾಹನ ಶೋಧನೆ…' : 'Search live Supabase database...'}
                className="text-ink h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                onClick={() => setOpen(false)}
                className="hover:bg-canvas hover:text-ink rounded-md p-1 text-slate-400"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="text-ink-muted p-4 text-center text-xs">
                  {language === 'kn' ? 'ಯಾವುದೇ ಮಾಹಿತಿಗಳು ಸಿಕ್ಕಿಲ್ಲ.' : 'No matching database records found.'}
                </p>
              )}
              {results.map((r, i) => {
                const Icon = KIND_ICON[r.kind]
                return (
                  <button
                    key={r.key + i}
                    onClick={() => go(r)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
                      active === i ? 'bg-navy text-white' : 'hover:bg-canvas text-ink',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg',
                        active === i ? 'text-cyan bg-white/10' : 'bg-canvas text-slate-500',
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{r.title}</p>
                      <p className={cn('truncate text-[11px]', active === i ? 'text-slate-300' : 'text-ink-muted')}>
                        {r.subtitle}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
