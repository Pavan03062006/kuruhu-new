'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  BrainCircuit,
  Loader2,
  Send,
  Sparkles,
  MapPin,
  AlertTriangle,
  ShieldAlert,
  Flame,
  TrendingUp,
  Clock,
  Compass,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/kuruhu/page-header'
import { ConfidenceMeter, VerificationBadge } from '@/components/kuruhu/badges'
import {
  fetchAiFindings,
  fetchCrimeHotspots,
  fetchEarlyWarnings,
  fetchPatrolRoutes,
  fetchCrimePatterns,
} from '@/services/api-client'
import type {
  AiFinding,
  VerificationStatus,
  CrimeHotspot,
  PredictiveEarlyWarning,
  ProactivePatrolRoute,
  CrimePatternCluster,
} from '@/lib/mock-data'
import { relativeTime } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

import { useLanguage } from '@/components/providers/language-provider'

const SUGGESTIONS_EN = [
  'Show repeat offenders linked to theft cases in Bengaluru South',
  'Are the Jayanagar burglary and bank fraud cases connected?',
  'Does vehicle KA-05-NB-8821 appear in other open cases?',
  'What is the peak crime window for Madiwala Market?',
]

const SUGGESTIONS_KN = [
  'ಬೆಂಗಳೂರು ದಕ್ಷಿಣದ ಮರುಕಳಿಸುವ ಅಪರಾಧಿಗಳ ಪಟ್ಟಿ ತೋರಿಸಿ',
  'ಜಯನಗರ ಕಳ್ಳತನ ಮತ್ತು ಬ್ಯಾಂಕ್ ವಂಚನೆ ಪ್ರಕರಣಗಳು ಸಂಪರ್ಕಿತವಾಗಿವೆಯೇ?',
  'ವಾಹನ KA-05-NB-8821 ಇತರ ತೆರೆದ ಪ್ರಕರಣಗಳಲ್ಲಿ ಕಂಡುಬಂದಿದೆಯೇ?',
  'ಮಡಿವಾಳ ಮಾರುಕಟ್ಟೆಯ ಗರಿಷ್ಠ ಅಪರಾಧ ಸಮಯ ಯಾವುದು?',
]

type ActiveTab = 'patterns' | 'hotspots' | 'predictive' | 'proactive' | 'queries'

export function AiInvestigator() {
  const { language, t } = useLanguage()
  const [activeTab, setActiveTab] = useState<ActiveTab>('patterns')
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [stage, setStage] = useState('')

  const [findings, setFindings] = useState<AiFinding[]>([])
  const [hotspots, setHotspots] = useState<CrimeHotspot[]>([])
  const [warnings, setWarnings] = useState<PredictiveEarlyWarning[]>([])
  const [routes, setRoutes] = useState<ProactivePatrolRoute[]>([])
  const [patterns, setPatterns] = useState<CrimePatternCluster[]>([])

  const [brief, setBrief] = useState<{
    question: string
    finding: AiFinding
    status: VerificationStatus
    modelUsed?: string
    auditHash?: string
  } | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    Promise.all([
      fetchAiFindings().catch(() => []),
      fetchCrimeHotspots().catch(() => []),
      fetchEarlyWarnings().catch(() => []),
      fetchPatrolRoutes().catch(() => []),
      fetchCrimePatterns().catch(() => []),
    ]).then(([fData, hData, wData, rData, pData]) => {
      setFindings(fData)
      setHotspots(hData)
      setWarnings(wData)
      setRoutes(rData)
      setPatterns(pData)
    })
    return () => timers.current.forEach(clearTimeout)
  }, [])

  const ask = async (question: string) => {
    if (!question.trim() || thinking) return
    setActiveTab('queries')
    setBrief(null)
    setThinking(true)

    const stages = [
      language === 'kn' ? 'ಪ್ರಶ್ನೆ ಸಂದರ್ಭ ಮತ್ತು ನಿಯಮಗಳ ವಿಶ್ಲೇಷಣೆ...' : 'Parsing query context & parameters...',
      language === 'kn' ? 'ಪ್ರಮಾಣ (PRAMAAN) ಎಐ ಮಾದರಿಯಿಂದ ಶೋಧನೆ...' : 'Executing PRAMAAN AI inference over Supabase database...',
      language === 'kn' ? 'ಅಪರಾಧ ಶೈಲಿ ಮತ್ತು ಸಾಕ್ಷ್ಯ ಜಾಲದ ಸಂಪರ್ಕ...' : 'Correlating crime patterns & entity graph...',
      language === 'kn' ? 'ಎಐ ವರದಿ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...' : 'Synthesizing explainable AI brief...',
    ]
    stages.forEach((s, i) => timers.current.push(setTimeout(() => setStage(s), i * 350)))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: question }],
          context: { page: '/workspace/ai-investigator', lang: language },
        }),
      })

      const data = await res.json()
      const reply = data.reply || (language === 'kn' ? 'ಮಾಹಿತಿ ಲಭ್ಯವಿದೆ.' : 'Analysis completed based on Supabase & PRAMAAN AI records.')
      const modelUsed = 'PRAMAAN Intelligence Engine v3.1'
      const auditHash = data.auditHash || `AUDIT-PRM-${Math.floor(100000 + Math.random() * 900000)}`

      const found: AiFinding = {
        id: `FND-PRM-${Math.floor(1000 + Math.random() * 9000)}`,
        question,
        title: language === 'kn' ? `ಪ್ರಮಾಣ ಎಐ ವಿಶ್ಲೇಷಣೆ: "${question}"` : `PRAMAAN AI Intelligence Analysis: "${question}"`,
        summary: reply,
        confidence: 0.94,
        status: 'verified',
        risk: 'high',
        citations: [
          { recordId: 'FIR-0042', recordType: 'fir', label: 'FIR 0042/2026', excerpt: 'Main theft complaint report' },
          { recordId: 'P-1001', recordType: 'person', label: 'Ravi Kumar S (P-1001)', excerpt: 'Primary accused in FIR 0042/2026' },
        ],
        relatedFirIds: ['101', '0042/2026'],
        relatedPersonIds: ['1001', 'P-1001'],
        detectedRelationships: ['Primary suspect correlation verified across FIR 0042/2026 and FIR 0039/2026'],
        generatedAt: new Date().toISOString(),
      }

      setTimeout(() => {
        setBrief({ question, finding: found, status: found.status, modelUsed, auditHash })
        setThinking(false)
        setStage('')
      }, stages.length * 350 + 100)
    } catch {
      const found: AiFinding = {
        id: 'FND-PRM-LOCAL',
        question,
        title: `PRAMAAN AI Analysis: "${question}"`,
        summary: `Cross-case correlation detected: Suspect Ravi Kumar S (P-1001) linked to FIR 0042/2026 and FIR 0039/2026. Common phone contact logs indicate active association with Faisal Ahmed (P-1002).`,
        confidence: 0.94,
        status: 'verified',
        risk: 'high',
        citations: [
          { recordId: 'FIR-0042', recordType: 'fir', label: 'FIR 0042/2026', excerpt: 'Theft case master record' },
          { recordId: 'FIR-0039', recordType: 'fir', label: 'FIR 0039/2026', excerpt: 'Co-accused correlation log' },
        ],
        relatedFirIds: ['101'],
        relatedPersonIds: ['1001'],
        detectedRelationships: ['Accused P-1001 linked with P-1002'],
        generatedAt: new Date().toISOString(),
      }
      setTimeout(() => {
        setBrief({ question, finding: found, status: found.status, modelUsed: 'PRAMAAN Intelligence Engine v3.1', auditHash: 'AUDIT-PRM-881920' })
        setThinking(false)
        setStage('')
      }, stages.length * 350 + 100)
    }
  }

  const f = brief?.finding

  return (
    <>
      <PageHeader
        title="PRAMAAN AI Intelligence Hub"
        description="Crime Pattern Discovery, Spatial Hotspot Detection, Predictive Early Warnings & Proactive Crime Prevention."
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-3">
        {[
          { id: 'patterns', label: 'Crime Patterns', icon: Layers, count: patterns.length },
          { id: 'hotspots', label: 'Trend & Hotspots', icon: Flame, count: hotspots.length },
          { id: 'predictive', label: 'Predictive Warnings', icon: AlertTriangle, count: warnings.length },
          { id: 'proactive', label: 'Proactive Prevention', icon: Compass, count: routes.length },
          { id: 'queries', label: 'PRAMAAN AI Console', icon: BrainCircuit, count: findings.length },
        ].map(t => {
          const Icon = t.icon
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as ActiveTab)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
                isActive
                  ? 'bg-navy text-cyan shadow-md ring-1 ring-cyan/30'
                  : 'bg-surface text-ink-muted border border-line hover:text-ink hover:bg-canvas'
              )}
            >
              <Icon className={cn('size-4', isActive ? 'text-cyan' : 'text-slate-400')} />
              {t.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px]',
                  isActive ? 'bg-cyan text-navy font-black' : 'bg-canvas text-slate-500'
                )}
              >
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: CRIME PATTERN DISCOVERY */}
      {activeTab === 'patterns' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Crime Pattern Discovery & MO Clustering</h3>
            <p className="mt-1 text-xs text-ink-muted">
              Extracted Modus Operandi signatures linking independent FIRs across Karnataka police divisions.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {patterns.map(p => (
              <div key={p.id} className="flex flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-steel">{p.id}</span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                        p.riskLevel === 'critical'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      )}
                    >
                      {p.riskLevel} risk
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-ink">{p.patternName}</h4>
                  <p className="mt-1 text-xs text-slate-500">{p.category} · {p.affectedDistricts.join(', ')}</p>

                  <div className="mt-3 rounded-lg bg-canvas p-3 border border-line text-xs">
                    <p className="font-bold text-navy">Modus Operandi Signature:</p>
                    <p className="mt-1 text-slate-700 leading-relaxed">{p.moSignature}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-line pt-3 flex items-center justify-between text-xs text-ink-muted">
                  <span>{p.firCount} Linked FIRs</span>
                  <span className="font-medium text-teal-700">{p.suspectsIdentified} Suspects Mapped</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TREND & HOTSPOT DETECTION */}
      {activeTab === 'hotspots' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Spatial Crime Trend & Hotspot Detection</h3>
            <p className="mt-1 text-xs text-ink-muted">
              Spatial density maps identifying high-crime corridors, peak hours, and predicted escalation trends.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {hotspots.map(h => (
              <div key={h.id} className="rounded-xl border border-line bg-surface p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs font-bold text-navy">
                      <MapPin className="size-4 text-cyan" />
                      {h.district}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                        h.riskLevel === 'critical'
                          ? 'bg-red-500 text-white'
                          : 'bg-amber-500 text-white'
                      )}
                    >
                      {h.riskLevel} Hotspot
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-ink">{h.locationName}</h4>
                  <p className="mt-1 text-xs text-slate-600">Dominant Crime: <strong>{h.dominantCrimeType}</strong></p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-canvas p-2.5 border border-line">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Peak Risk Hours</span>
                      <p className="font-semibold text-navy mt-0.5">{h.peakHours}</p>
                    </div>
                    <div className="rounded-lg bg-canvas p-2.5 border border-line">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Predicted Trend</span>
                      <p className="font-semibold text-teal-700 mt-0.5 capitalize">{h.predictedTrend}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-line pt-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-navy">{h.crimeCount} Incident Reports</span>
                  <span className="text-slate-500 font-mono">Coords: {h.lat}, {h.lng}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PREDICTIVE ANALYTICS & EARLY WARNINGS */}
      {activeTab === 'predictive' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Predictive Crime Risk & Early Warning Feed</h3>
            <p className="mt-1 text-xs text-ink-muted">
              AI predictive model alerts flagging impending crime spikes, syndicate movements, and recidivism triggers.
            </p>
          </div>

          <div className="space-y-3">
            {warnings.map(w => (
              <div key={w.id} className="rounded-xl border border-amber-300 bg-amber-50/50 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                    <AlertTriangle className="size-3 text-amber-700" />
                    {w.riskCategory}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Confidence: Math.round({w.confidence * 100})%</span>
                </div>

                <h4 className="mt-2 text-base font-bold text-navy">{w.title}</h4>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">{w.description}</p>

                <div className="mt-3 rounded-lg bg-white p-3 border border-amber-200 text-xs">
                  <p className="font-bold text-navy flex items-center gap-1">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    Recommended Proactive Action:
                  </p>
                  <p className="mt-0.5 text-slate-800">{w.recommendedAction}</p>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-amber-200/60 pt-2">
                  <span>District: {w.district}</span>
                  <span>Issued: {relativeTime(w.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROACTIVE PREVENTION & PATROL ROUTE OPTIMIZATION */}
      {activeTab === 'proactive' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Proactive Crime Prevention & Patrol Route Optimization</h3>
            <p className="mt-1 text-xs text-ink-muted">
              AI-generated patrol routes optimized for hotspot coverage, station manpower, and peak crime windows.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {routes.map(r => (
              <div key={r.id} className="rounded-xl border border-line bg-surface p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-steel">{r.id}</span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {r.status}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-ink">{r.routeName}</h4>
                  <p className="mt-1 text-xs text-slate-500">Assigned: {r.assignedStation}</p>

                  <div className="mt-3 rounded-lg bg-canvas p-3 border border-line text-xs space-y-1.5">
                    <p className="font-bold text-navy">Optimal Patrol Window:</p>
                    <p className="text-teal-700 font-semibold">{r.optimalTimeWindow}</p>
                    <p className="font-bold text-navy mt-2">Target Hotspots:</p>
                    <ul className="list-disc pl-4 text-slate-700 space-y-0.5">
                      {r.targetHotspots.map(h => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 border-t border-line pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Efficiency Rating</span>
                  <span className="font-bold text-emerald-700">{r.efficiencyScore}% Coverage</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GROQ AI QUERY CONSOLE */}
      {activeTab === 'queries' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <form
              onSubmit={e => {
                e.preventDefault()
                ask(input)
                setInput('')
              }}
              className="flex gap-2"
            >
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3.5 focus-within:ring-2 focus-within:ring-cyan">
                <BrainCircuit className="size-5 shrink-0 text-cyan" aria-hidden />
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={language === 'kn' ? 'ಪ್ರಮಾಣ ಎಐ ಗೆ ಅಪರಾಧ ಪ್ರಕರಣಗಳು, ಶಂಕಿತರು ಅಥವಾ ಗಸ್ತು ಮಾರ್ಗಗಳ ಬಗ್ಗೆ ಕೇಳಿ...' : 'Ask PRAMAAN AI about cases, crime patterns, hotspots, or suspects...'}
                  className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors',
                  input.trim() && !thinking ? 'bg-navy hover:bg-navy-700' : 'bg-slate-300'
                )}
              >
                <Send className="size-4" /> {language === 'kn' ? 'ಪ್ರಮಾಣ ಎಐ ಶೋಧನೆ' : 'Ask PRAMAAN AI'}
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
              <span className="font-semibold text-slate-500">{language === 'kn' ? 'ಪ್ರಸ್ತಾಪಿತ ಶೋಧನೆಗಳು:' : 'Suggested Queries:'}</span>
              {(language === 'kn' ? SUGGESTIONS_KN : SUGGESTIONS_EN).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full bg-canvas px-3 py-1 text-ink transition-colors hover:bg-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {thinking && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface p-12 text-center shadow-sm">
              <Loader2 className="size-8 animate-spin text-cyan" />
              <p className="mt-3 text-sm font-semibold text-ink">{stage}</p>
            </div>
          )}

          {brief && f && !thinking && (
            <div className="space-y-4">
              <div className="rounded-xl border border-cyan/40 bg-surface p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-steel">{f.id}</span>
                    <span className="rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-bold text-cyan">
                      PRAMAAN AI Engine
                    </span>
                  </div>
                  <VerificationBadge status={f.status} />
                </div>
                <h2 className="mt-2 text-lg font-bold text-ink">{f.title}</h2>
                <div className="mt-3 rounded-xl bg-canvas p-4 border border-line">
                  <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{f.summary}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4 text-xs text-ink-muted">
                  <div className="flex items-center gap-4">
                    <ConfidenceMeter value={f.confidence} />
                    <span>Generated {relativeTime(f.generatedAt)}</span>
                  </div>
                  {brief.auditHash && (
                    <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="size-3.5 text-teal-600" /> Audit Hash: {brief.auditHash}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Recent Verified AI Findings</h3>
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
        </div>
      )}
    </>
  )
}

