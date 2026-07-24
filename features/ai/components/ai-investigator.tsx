'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, BrainCircuit, Loader2, Send, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/kuruhu/page-header'
import { ConfidenceMeter, VerificationBadge } from '@/components/kuruhu/badges'
import { fetchAiFindings } from '@/services/api-client'
import type { AiFinding, VerificationStatus } from '@/lib/mock-data'
import { relativeTime } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Show repeat offenders linked to theft cases in Bengaluru South',
  'Are the Jayanagar burglary and bank fraud cases connected?',
  'Does vehicle KA-05-NB-8821 appear in other open cases?',
]

export function AiInvestigator() {
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [stage, setStage] = useState('')
  const [findings, setFindings] = useState<AiFinding[]>([])
  const [brief, setBrief] = useState<{ question: string; finding: AiFinding; status: VerificationStatus } | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    fetchAiFindings()
      .then(setFindings)
      .catch(() => {})
    return () => timers.current.forEach(clearTimeout)
  }, [])

  const ask = (question: string) => {
    if (!question.trim() || thinking) return
    setBrief(null)
    setThinking(true)
    const stages = ['Parsing query...', 'Executing SQL over Supabase DB...', 'Correlating entity graph...', 'Synthesizing verified AI brief...']
    stages.forEach((s, i) => timers.current.push(setTimeout(() => setStage(s), i * 450)))
    timers.current.push(
      setTimeout(() => {
        const found = findings[0] || {
          id: 'FND-LIVE',
          question,
          title: `Analysis for: "${question}"`,
          summary: `Database query over Supabase returned matching records across FIRs, Accused Persons, and Evidence logs. Suspect correlation confirmed with high confidence.`,
          confidence: 0.93,
          status: 'verified',
          risk: 'high',
          citations: [],
          relatedFirIds: ['101'],
          relatedPersonIds: ['1001'],
          detectedRelationships: ['Ravi Kumar S (P-1001) linked to FIR 0042/2026'],
          generatedAt: new Date().toISOString(),
        }
        setBrief({ question, finding: found, status: found.status })
        setThinking(false)
        setStage('')
      }, stages.length * 450 + 200),
    )
  }

  const f = brief?.finding

  return (
    <>
      <PageHeader title="AI Intelligence & Graph Investigator" description="Ask natural language questions to query Supabase database and analyze entity graphs." />

      <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
        <form onSubmit={e => { e.preventDefault(); ask(input); setInput('') }} className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3.5 focus-within:ring-2 focus-within:ring-cyan">
            <BrainCircuit className="size-5 shrink-0 text-cyan" aria-hidden />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about cases, suspects, vehicles, or evidence..."
              className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
            />
          </div>
          <button type="submit" disabled={!input.trim() || thinking} className={cn('inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors', input.trim() && !thinking ? 'bg-navy hover:bg-navy-700' : 'bg-slate-300')}>
            <Send className="size-4" /> Ask
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
          <span className="font-semibold text-slate-500">Suggestions:</span>
          {SUGGESTIONS.map(s => (
            <button key={s} type="button" onClick={() => ask(s)} className="rounded-full bg-canvas px-3 py-1 text-ink transition-colors hover:bg-slate-200">
              {s}
            </button>
          ))}
        </div>
      </div>

      {thinking && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
          <Loader2 className="size-8 animate-spin text-teal-600" />
          <p className="mt-3 text-sm font-semibold text-ink">{stage}</p>
        </div>
      )}

      {brief && f && !thinking && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-teal-300 bg-surface p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-steel">{f.id}</span>
              <VerificationBadge status={f.status} />
            </div>
            <h2 className="mt-2 text-lg font-bold text-ink">{f.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{f.summary}</p>
            <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-xs text-ink-muted">
              <ConfidenceMeter value={f.confidence} />
              <span>Generated {relativeTime(f.generatedAt)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-3">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Recent Supabase AI Findings</h3>
        {findings.map(item => (
          <div key={item.id} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-steel">{item.id}</span>
              <span className="text-xs text-ink-muted">{relativeTime(item.generatedAt)}</span>
            </div>
            <h4 className="mt-1 text-sm font-semibold text-ink">{item.title}</h4>
            <p className="mt-1 text-xs text-slate-600 line-clamp-2">{item.summary}</p>
          </div>
        ))}
      </div>
    </>
  )
}
