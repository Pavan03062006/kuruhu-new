import Link from 'next/link'
import { ArrowUpRight, Quote, Sparkles } from 'lucide-react'
import { ConfidenceMeter, RiskBadge, VerificationBadge } from '@/components/kuruhu/badges'
import { EntityChip } from '@/components/kuruhu/entity-chip'
import { firById, formatTime, personById, type AiFinding } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function AiFindingCard({ finding, compact = false, className }: { finding: AiFinding; compact?: boolean; className?: string }) {
  return (
    <article className={cn('rounded-xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md', className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
          <span className="inline-flex size-6 items-center justify-center rounded-md bg-navy text-cyan"><Sparkles className="size-3.5" aria-hidden /></span>
          AI finding · {finding.id} · {formatTime(finding.generatedAt)}
        </div>
        <VerificationBadge status={finding.status} />
      </div>

      <h3 className="mt-3 text-[15px] font-semibold leading-snug text-ink">{finding.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{finding.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <ConfidenceMeter value={finding.confidence} />
        <RiskBadge risk={finding.risk} />
        {finding.verifiedBy && <span className="text-xs text-ink-muted">Reviewed by {finding.verifiedBy}</span>}
      </div>

      {!compact && (
        <>
          <div className="mt-4 space-y-2 border-t border-line pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Source citations</p>
            {finding.citations.map(c => (
              <div key={c.recordId + c.excerpt} className="flex items-start gap-2 rounded-lg bg-canvas px-3 py-2">
                <Quote className="mt-0.5 size-3 shrink-0 text-slate-400" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink">{c.label}</p>
                  <p className="truncate text-xs text-ink-muted">“{c.excerpt}”</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {finding.relatedFirIds.map(id => {
              const f = firById(id)
              return f ? <EntityChip key={id} kind="fir" label={`FIR ${f.number}`} href={`/workspace/firs/${f.id}`} /> : null
            })}
            {finding.relatedPersonIds.map(id => {
              const p = personById(id)
              return p ? <EntityChip key={id} kind="person" label={p.name} href={`/workspace/persons/${p.id}`} /> : null
            })}
          </div>
        </>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <p className="text-[11px] text-ink-muted">AI findings are not evidence. Verify through source records.</p>
        <Link href="/workspace/ai-investigator" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800">
          Open in AI Investigator <ArrowUpRight className="size-3" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
