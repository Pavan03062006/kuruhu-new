'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, CloudUpload, FileText, Gavel, MapPin, Package, Save, ShieldCheck, User, Users, X,
} from 'lucide-react'
import { PageHeader } from '@/components/kuruhu/page-header'
import { DISTRICTS } from '@/lib/mock-data'
import { createFirInSupabase } from '@/services/api-client'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Incident details', icon: FileText },
  { label: 'Location & jurisdiction', icon: MapPin },
  { label: 'Complainant', icon: User },
  { label: 'Involved persons', icon: Users },
  { label: 'Evidence', icon: Package },
  { label: 'Applicable sections', icon: Gavel },
  { label: 'Officer assignment', icon: ShieldCheck },
  { label: 'Review', icon: CheckCircle2 },
  { label: 'Submit', icon: CloudUpload },
] as const

const OFFENCE_TYPES = ['Theft / snatching', 'Burglary', 'Assault', 'Extortion', 'Cheating / fraud', 'Vehicle theft', 'Missing person', 'Other']
const SECTION_SUGGESTIONS = ['BNS 303(2) — Theft', 'BNS 304(2) — Snatching', 'BNS 305 — Theft in dwelling', 'BNS 308(5) — Extortion', 'BNS 115(2) — Voluntarily causing hurt', 'BNS 331(4) — House-breaking at night', 'BNS 351(2) — Criminal intimidation', 'BNS 317(2) — Receiving stolen property']
const OFFICERS = ['Insp. Meera Kulkarni — Jayanagar PS', 'PSI Divya R — Jayanagar PS', 'Insp. Ramesh Gowda — Halasuru Gate PS', 'PSI Anand T — Electronic City PS']
const STATIONS = ['Jayanagar PS', 'Indiranagar PS', 'Halasuru Gate PS', 'Peenya PS', 'Upparpet PS', 'Electronic City PS']

type PersonEntry = { name: string; role: string; note: string }
type EvidenceEntry = { label: string; type: string }

type Draft = {
  offenceType: string; incidentDate: string; incidentTime: string; narrative: string
  location: string; area: string; district: string; station: string
  complainantName: string; complainantPhone: string; complainantAddress: string
  persons: PersonEntry[]
  evidence: EvidenceEntry[]
  sections: string[]
  officer: string; priority: string
}

const EMPTY: Draft = {
  offenceType: '', incidentDate: '', incidentTime: '', narrative: '',
  location: '', area: '', district: 'Bengaluru City', station: '',
  complainantName: '', complainantPhone: '', complainantAddress: '',
  persons: [], evidence: [], sections: [], officer: '', priority: 'medium',
}

const DRAFT_KEY = 'kuruhu.fir-draft'

export function FirCreationWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [attempted, setAttempted] = useState(false)

  // Restore + autosave draft (restore runs async so hydration stays consistent)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(DRAFT_KEY)
        if (raw) setDraft({ ...EMPTY, ...(JSON.parse(raw) as Draft) })
      } catch { /* ignore corrupted draft */ }
    }, 0)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        setSavedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
      } catch { /* storage unavailable */ }
    }, 600)
    return () => clearTimeout(t)
  }, [draft])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(d => ({ ...d, [key]: value }))

  const stepValid = useMemo(() => {
    switch (step) {
      case 0: return draft.offenceType !== '' && draft.incidentDate !== '' && draft.narrative.trim().length >= 30
      case 1: return draft.location.trim() !== '' && draft.district !== '' && draft.station !== ''
      case 2: return draft.complainantName.trim() !== '' && /^[6-9]\d{9}$/.test(draft.complainantPhone)
      case 5: return draft.sections.length > 0
      case 6: return draft.officer !== ''
      default: return true
    }
  }, [step, draft])

  const next = async () => {
    if (!stepValid) { setAttempted(true); return }
    setAttempted(false)
    if (step === STEPS.length - 1) {
      try {
        const generatedCrimeNo = `${Math.floor(100 + Math.random() * 900)}/2026`
        await createFirInSupabase({
          crime_number: generatedCrimeNo,
          brief_facts: `${draft.offenceType}: ${draft.narrative}`,
        })
      } catch (err) {
        console.warn('Supabase insertion notice:', err)
      }
      window.localStorage.removeItem(DRAFT_KEY)
      setSubmitted(true)
      return
    }
    setStep(s => s + 1)
  }

  const inputCls = 'h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-cyan'
  const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-ink-muted'
  const err = (ok: boolean) => attempted && !ok

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="size-8" aria-hidden /></span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">FIR submitted for registration</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
          Reference <span className="font-mono font-semibold text-ink">DRAFT-0252/2026</span> has been queued at {draft.station || 'your station'}.
          The station house officer will confirm registration and the audit trail has recorded this submission.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/workspace/firs" className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700">Go to FIR Directory</Link>
          <button onClick={() => { setDraft(EMPTY); setSubmitted(false); setStep(0) }} className="rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas">Create another</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Create FIR"
        description="Guided intake. Your draft saves automatically at every step."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-muted">
            <Save className="size-3.5 text-teal-600" aria-hidden /> {savedAt ? `Draft saved ${savedAt}` : 'Draft autosave on'}
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Step rail */}
        <ol className="lg:col-span-1" aria-label="Creation steps">
          {STEPS.map((s, i) => (
            <li key={s.label}>
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors',
                  i === step ? 'bg-navy text-white' : i < step ? 'text-ink hover:bg-white' : 'cursor-not-allowed text-slate-400',
                )}
                aria-current={i === step ? 'step' : undefined}
              >
                <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', i < step ? 'bg-teal-100 text-teal-700' : i === step ? 'bg-cyan text-navy' : 'bg-slate-200 text-slate-500')}>
                  {i < step ? <Check className="size-3.5" aria-hidden /> : i + 1}
                </span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>

        {/* Step body */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
            {step === 0 && (
              <div className="space-y-5">
                <StepTitle icon={FileText} title="Incident details" desc="What happened, and when." />
                <div>
                  <label className={labelCls} htmlFor="offence">Offence type</label>
                  <select id="offence" value={draft.offenceType} onChange={e => set('offenceType', e.target.value)} className={cn(inputCls, err(draft.offenceType !== '') && 'border-red-400')}>
                    <option value="">Select offence type…</option>
                    {OFFENCE_TYPES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor="idate">Incident date</label>
                    <input id="idate" type="date" value={draft.incidentDate} onChange={e => set('incidentDate', e.target.value)} className={cn(inputCls, err(draft.incidentDate !== '') && 'border-red-400')} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="itime">Approximate time</label>
                    <input id="itime" type="time" value={draft.incidentTime} onChange={e => set('incidentTime', e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} htmlFor="narrative">Incident narrative</label>
                  <textarea id="narrative" rows={5} value={draft.narrative} onChange={e => set('narrative', e.target.value)} placeholder="Describe the sequence of events in the complainant's words (minimum 30 characters)…" className={cn('w-full rounded-lg border border-line bg-white p-3 text-sm leading-relaxed text-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-cyan', err(draft.narrative.trim().length >= 30) && 'border-red-400')} />
                  <p className={cn('mt-1 text-xs', draft.narrative.trim().length >= 30 ? 'text-ink-muted' : 'text-slate-400')}>{draft.narrative.trim().length}/30 characters minimum</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <StepTitle icon={MapPin} title="Location & jurisdiction" desc="Where it happened and which station holds jurisdiction." />
                <div>
                  <label className={labelCls} htmlFor="loc">Incident location</label>
                  <input id="loc" value={draft.location} onChange={e => set('location', e.target.value)} placeholder="e.g. 4th Block Market, near south gate" className={cn(inputCls, err(draft.location.trim() !== '') && 'border-red-400')} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelCls} htmlFor="area">Area / locality</label>
                    <input id="area" value={draft.area} onChange={e => set('area', e.target.value)} placeholder="Jayanagar" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="district">District</label>
                    <select id="district" value={draft.district} onChange={e => set('district', e.target.value)} className={inputCls}>
                      {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="station">Police station</label>
                    <select id="station" value={draft.station} onChange={e => set('station', e.target.value)} className={cn(inputCls, err(draft.station !== '') && 'border-red-400')}>
                      <option value="">Select station…</option>
                      {STATIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <StepTitle icon={User} title="Complainant information" desc="Identity and contact of the person filing the report." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor="cname">Full name</label>
                    <input id="cname" value={draft.complainantName} onChange={e => set('complainantName', e.target.value)} placeholder="As per identity document" className={cn(inputCls, err(draft.complainantName.trim() !== '') && 'border-red-400')} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="cphone">Mobile number</label>
                    <input id="cphone" inputMode="numeric" maxLength={10} value={draft.complainantPhone} onChange={e => set('complainantPhone', e.target.value.replace(/\D/g, ''))} placeholder="98XXXXXXXX" className={cn(inputCls, err(/^[6-9]\d{9}$/.test(draft.complainantPhone)) && 'border-red-400')} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} htmlFor="caddr">Address</label>
                  <input id="caddr" value={draft.complainantAddress} onChange={e => set('complainantAddress', e.target.value)} placeholder="Residential address" className={inputCls} />
                </div>
              </div>
            )}

            {step === 3 && (
              <ListStep<PersonEntry>
                icon={Users}
                title="Involved persons"
                desc="Accused, suspects, witnesses, and victims known at this stage. This can be updated later."
                items={draft.persons}
                onChange={items => set('persons', items)}
                fields={[
                  { key: 'name', label: 'Name', placeholder: 'Person name' },
                  { key: 'role', label: 'Role', placeholder: 'accused / suspect / witness / victim' },
                  { key: 'note', label: 'Note', placeholder: 'Identifying details (optional)' },
                ]}
                empty={{ name: '', role: '', note: '' }}
                required={['name', 'role']}
                render={p => <><span className="font-semibold text-ink">{p.name}</span> <span className="capitalize text-ink-muted">— {p.role}</span>{p.note && <span className="text-ink-muted"> · {p.note}</span>}</>}
              />
            )}

            {step === 4 && (
              <ListStep<EvidenceEntry>
                icon={Package}
                title="Evidence"
                desc="Items, documents, or digital material collected or expected."
                items={draft.evidence}
                onChange={items => set('evidence', items)}
                fields={[
                  { key: 'label', label: 'Item', placeholder: 'e.g. CCTV footage — market entrance' },
                  { key: 'type', label: 'Type', placeholder: 'physical / digital / document / cctv' },
                ]}
                empty={{ label: '', type: '' }}
                required={['label']}
                render={e => <><span className="font-semibold text-ink">{e.label}</span>{e.type && <span className="capitalize text-ink-muted"> — {e.type}</span>}</>}
              />
            )}

            {step === 5 && (
              <div className="space-y-5">
                <StepTitle icon={Gavel} title="Applicable sections" desc="Select all sections that apply. At least one is required." />
                {err(draft.sections.length > 0) && <p className="text-xs text-red-600">Select at least one applicable section.</p>}
                <div className="grid gap-2 sm:grid-cols-2">
                  {SECTION_SUGGESTIONS.map(s => {
                    const on = draft.sections.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => set('sections', on ? draft.sections.filter(x => x !== s) : [...draft.sections, s])}
                        aria-pressed={on}
                        className={cn('flex items-center justify-between rounded-lg border px-3.5 py-3 text-left text-[13px] font-medium transition-colors', on ? 'border-navy bg-navy text-white' : 'border-line bg-white text-ink hover:border-slate-300')}
                      >
                        {s}
                        {on && <Check className="size-4 shrink-0 text-cyan" aria-hidden />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-5">
                <StepTitle icon={ShieldCheck} title="Officer assignment" desc="Assign the investigating officer and set case priority." />
                <div>
                  <label className={labelCls} htmlFor="officer">Investigating officer</label>
                  <select id="officer" value={draft.officer} onChange={e => set('officer', e.target.value)} className={cn(inputCls, err(draft.officer !== '') && 'border-red-400')}>
                    <option value="">Select officer…</option>
                    {OFFICERS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <span className={labelCls}>Priority</span>
                  <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Priority">
                    {['critical', 'high', 'medium', 'low'].map(p => (
                      <button key={p} type="button" role="radio" aria-checked={draft.priority === p} onClick={() => set('priority', p)} className={cn('rounded-lg border px-4 py-2 text-[13px] font-semibold capitalize transition-colors', draft.priority === p ? 'border-navy bg-navy text-white' : 'border-line bg-white text-ink hover:border-slate-300')}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4">
                <StepTitle icon={CheckCircle2} title="Review" desc="Confirm every detail before submission. Jump back to any step to edit." />
                <dl className="divide-y divide-line rounded-lg border border-line">
                  {[
                    ['Offence', `${draft.offenceType} · ${draft.incidentDate} ${draft.incidentTime}`.trim()],
                    ['Narrative', draft.narrative || '—'],
                    ['Location', [draft.location, draft.area, draft.district].filter(Boolean).join(', ')],
                    ['Jurisdiction', draft.station || '—'],
                    ['Complainant', draft.complainantName ? `${draft.complainantName} · +91 ${draft.complainantPhone}` : '—'],
                    ['Persons', draft.persons.length ? draft.persons.map(p => `${p.name} (${p.role})`).join('; ') : 'None recorded'],
                    ['Evidence', draft.evidence.length ? draft.evidence.map(e => e.label).join('; ') : 'None recorded'],
                    ['Sections', draft.sections.length ? draft.sections.join('; ') : '—'],
                    ['Assignment', draft.officer ? `${draft.officer} · ${draft.priority} priority` : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-3 gap-3 px-4 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{k}</dt>
                      <dd className="col-span-2 text-[13px] leading-relaxed text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {step === 8 && (
              <div className="space-y-5 text-center">
                <StepTitle icon={CloudUpload} title="Submit for registration" desc="" />
                <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-muted">
                  Submitting will queue this FIR for registration at <span className="font-semibold text-ink">{draft.station || 'the selected station'}</span> and
                  record the action in the audit trail under your identity. This cannot be silently deleted after submission.
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-white hover:text-ink">
                <ArrowLeft className="size-4" aria-hidden /> Back
              </button>
            ) : (
              <button onClick={() => router.push('/workspace/firs')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-white hover:text-ink">
                Cancel
              </button>
            )}
            <button
              onClick={next}
              className={cn('inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-colors', stepValid ? 'bg-navy text-white hover:bg-navy-700' : 'bg-slate-200 text-slate-500')}
            >
              {step === STEPS.length - 1 ? 'Submit FIR' : 'Continue'} <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function StepTitle({ icon: Icon, title, desc }: { icon: typeof FileText; title: string; desc: string }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-navy text-cyan"><Icon className="size-4" aria-hidden /></span>
        <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
      </div>
      {desc && <p className="mt-1.5 text-sm text-ink-muted">{desc}</p>}
    </div>
  )
}

function ListStep<T extends Record<string, string>>({
  icon: Icon, title, desc, items, onChange, fields, empty, required, render,
}: {
  icon: typeof FileText
  title: string
  desc: string
  items: T[]
  onChange: (items: T[]) => void
  fields: { key: keyof T & string; label: string; placeholder: string }[]
  empty: T
  required: (keyof T & string)[]
  render: (item: T) => React.ReactNode
}) {
  const [entry, setEntry] = useState<T>(empty)
  const valid = required.every(k => entry[k].trim() !== '')
  return (
    <div className="space-y-5">
      <StepTitle icon={Icon} title={title} desc={desc} />
      <div className="grid gap-3 sm:grid-cols-3">
        {fields.map(f => (
          <div key={f.key} className={fields.length === 2 && f.key === fields[0].key ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted" htmlFor={`ls-${f.key}`}>{f.label}</label>
            <input
              id={`ls-${f.key}`}
              value={entry[f.key]}
              onChange={e => setEntry({ ...entry, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-cyan"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => { if (valid) { onChange([...items, entry]); setEntry(empty) } }}
        disabled={!valid}
        className={cn('rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors', valid ? 'bg-steel text-white hover:bg-steel-400' : 'bg-slate-200 text-slate-500')}
      >
        Add entry
      </button>
      <ul className="space-y-2">
        {items.length === 0 && <li className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-xs text-ink-muted">Nothing added yet — this step is optional.</li>}
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-4 py-2.5 text-[13px]">
            <span className="min-w-0 truncate">{render(item)}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove entry" className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-white hover:text-red-600">
              <X className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
