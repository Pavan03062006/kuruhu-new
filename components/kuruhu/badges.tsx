import type { FirStatus, Priority, VerificationStatus } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { CheckCircle2, CircleDashed, ShieldAlert, XCircle } from 'lucide-react'

const PRIORITY_STYLES: Record<Priority, string> = {
  critical: 'bg-red-50 text-red-700 ring-red-200',
  high: 'bg-amber-50 text-amber-700 ring-amber-200',
  medium: 'bg-sky-50 text-sky-700 ring-sky-200',
  low: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset', PRIORITY_STYLES[priority], className)}>
      {priority === 'critical' && <ShieldAlert className="size-3" aria-hidden />}
      {priority}
    </span>
  )
}

const STATUS_STYLES: Record<FirStatus, { label: string; cls: string; dot: string }> = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
  registered: { label: 'Registered', cls: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  investigating: { label: 'Investigating', cls: 'bg-teal-50 text-teal-700 ring-teal-200', dot: 'bg-teal-500' },
  review: { label: 'Under review', cls: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
  closed: { label: 'Closed', cls: 'bg-slate-100 text-slate-500 ring-slate-200', dot: 'bg-slate-400' },
}

export function StatusBadge({ status, className }: { status: FirStatus; className?: string }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset', s.cls, className)}>
      <span className={cn('size-1.5 rounded-full', s.dot)} aria-hidden />
      {s.label}
    </span>
  )
}

export function VerificationBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  if (status === 'verified')
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200', className)}>
        <CheckCircle2 className="size-3" aria-hidden /> Verified
      </span>
    )
  if (status === 'rejected')
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-inset ring-red-200', className)}>
        <XCircle className="size-3" aria-hidden /> Rejected
      </span>
    )
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200', className)}>
      <CircleDashed className="size-3" aria-hidden /> Awaiting verification
    </span>
  )
}

export function ConfidenceMeter({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(value * 100)
  const tone = pct >= 80 ? 'bg-teal-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className={cn('flex items-center gap-2', className)} role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Confidence ${pct} percent`}>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold tabular text-slate-700">{pct}%</span>
    </div>
  )
}

export function RiskBadge({ risk, className }: { risk: 'high' | 'medium' | 'low'; className?: string }) {
  const styles = { high: 'bg-red-50 text-red-700 ring-red-200', medium: 'bg-amber-50 text-amber-700 ring-amber-200', low: 'bg-slate-100 text-slate-600 ring-slate-200' }
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset', styles[risk], className)}>{risk} risk</span>
}
