import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Lock, ShieldAlert } from 'lucide-react'
import { CURRENT_OFFICER } from '@/lib/mock-data'

export const metadata: Metadata = { title: 'Access restricted' }

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-navy text-cyan">
        <Lock className="size-7" aria-hidden />
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">Error 403</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">This area requires higher authorisation</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        The record or module you tried to open is restricted. Access attempts are recorded in the audit trail.
      </p>

      <dl className="mx-auto mt-8 max-w-sm divide-y divide-line rounded-xl border border-line bg-surface text-left shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Required role</dt>
          <dd className="text-sm font-bold text-ink">Supervisor (ACP and above)</dd>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Your current role</dt>
          <dd className="text-sm font-medium text-ink">{CURRENT_OFFICER.role}</dd>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Scope</dt>
          <dd className="text-sm font-medium text-ink">{CURRENT_OFFICER.district}</dd>
        </div>
      </dl>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-700">
          <ShieldAlert className="size-4 text-cyan" aria-hidden /> Request access
        </button>
        <Link href="/workspace/" className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas">
          <ArrowLeft className="size-4" aria-hidden /> Back to Command Centre
        </Link>
      </div>
      <p className="mt-6 text-xs text-slate-400">Access requests are routed to your supervising officer with a mandatory justification note.</p>
    </div>
  )
}
