import Link from 'next/link'
import { Car, FileText, MapPin, Package, ShieldCheck, User } from 'lucide-react'
import type { EntityKind } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const KIND_META: Record<EntityKind, { icon: typeof User; cls: string }> = {
  person: { icon: User, cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100' },
  fir: { icon: FileText, cls: 'bg-teal-50 text-teal-700 ring-teal-200 hover:bg-teal-100' },
  vehicle: { icon: Car, cls: 'bg-sky-50 text-sky-700 ring-sky-200 hover:bg-sky-100' },
  location: { icon: MapPin, cls: 'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100' },
  evidence: { icon: Package, cls: 'bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100' },
  officer: { icon: ShieldCheck, cls: 'bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200' },
}

export function EntityChip({ kind, label, href, className }: { kind: EntityKind; label: string; href?: string; className?: string }) {
  const meta = KIND_META[kind]
  const Icon = meta.icon
  const body = (
    <>
      <Icon className="size-3" aria-hidden />
      <span className="truncate">{label}</span>
    </>
  )
  const cls = cn('inline-flex max-w-56 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors', meta.cls, className)
  if (href) return <Link href={href} className={cls}>{body}</Link>
  return <span className={cls}>{body}</span>
}
