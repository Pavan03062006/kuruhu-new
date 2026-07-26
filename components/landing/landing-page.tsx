'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight, BrainCircuit, CheckCircle2, ChevronDown, FileText, Fingerprint, GitBranch, Languages, Lock,
  Network, PlayCircle, ScrollText, Search, ShieldCheck, Sparkles, Users,
} from 'lucide-react'
import { BrowserFrame } from '@/components/landing/browser-frame'
import { Constellation } from '@/components/landing/constellation'
import { useAuth } from '@/features/auth/components/auth-provider'
import { cn } from '@/lib/utils'

/* ------------------------------ content ------------------------------ */

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Platform tour', href: '#tour' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'FAQ', href: '#faq' },
]

const RIBBON = ['Audit-logged', 'Role-gated access', 'Citation-first AI', '33 districts', 'Human verification', 'Source-linked evidence', 'ಕನ್ನಡ · English · हिन्दी · اردو']

const STATS = [
  { value: 2480, suffix: '+', label: 'FIRs connected' },
  { value: 6120, suffix: '+', label: 'Persons linked' },
  { value: 33, suffix: '', label: 'Districts covered' },
  { value: 4, suffix: 's', label: 'Average lookup' },
]

const TOUR = [
  {
    eyebrow: 'Command Centre',
    title: 'Every investigation, one operational picture',
    desc: 'Live metrics, priority cases, the AI verification queue, and a real-time activity feed — the state of your division at a glance, the moment you sign in.',
    points: ['Priority FIRs surfaced automatically', 'AI findings queued for human review', 'Every event feeds the audit trail'],
    img: '/screens/dashboard.webp',
    url: 'kuruhu.ksp.gov.in/workspace',
  },
  {
    eyebrow: 'Evidence Graph',
    title: 'See connections nobody wrote down',
    desc: 'FIRs, persons, vehicles, locations, and evidence rendered as a living graph. Hover to trace relationships; click to inspect. Every edge cites the source record that proves it.',
    points: ['Verified vs unverified edges, visually distinct', 'Filter by entity type or evidence status', 'One click from any node to its full record'],
    img: '/screens/graph.webp',
    url: 'kuruhu.ksp.gov.in/workspace/graph',
  },
  {
    eyebrow: 'AI Investigator',
    title: 'Ask in plain language. Verify with sources.',
    desc: 'Natural-language questions return structured investigation briefs — detected relationships, risk indicators, confidence scores — each backed by citations into actual case records.',
    points: ['Confidence score on every finding', 'Citations link straight to source records', 'Verify or reject — the decision is audited'],
    img: '/screens/ai.webp',
    url: 'kuruhu.ksp.gov.in/workspace/ai-investigator',
  },
]

const SECURITY = [
  { icon: ScrollText, title: 'Complete audit trails', desc: 'Every view, edit, link, and verification logged with actor, time, and context.' },
  { icon: Lock, title: 'Role-based access', desc: 'Permissions gate each module. Officers see exactly what their role authorises.' },
  { icon: Fingerprint, title: 'Verified identity', desc: 'Sessions bound to verified officers with device and district context.' },
  { icon: ShieldCheck, title: 'Data protection', desc: 'Encryption in transit and at rest; restricted records visibly marked.' },
]

const FAQS = [
  { q: 'Does the AI decide anything on its own?', a: 'No. KURUHU is verification-first by design. AI output is an assistive brief with confidence scores and source citations. Nothing becomes part of the case record until an authorised officer verifies it against sources.' },
  { q: 'Can AI findings be used as evidence?', a: 'No. AI findings are investigative leads, never evidence. Every finding carries a persistent notice and must be traced back to admissible source records by an officer.' },
  { q: 'Who can access KURUHU?', a: 'Only authorised law-enforcement personnel with verified identities. Access is role-based, district-scoped, and every session is monitored and logged.' },
  { q: 'How does KURUHU find hidden relationships?', a: 'It correlates structured fields across records — phone numbers, vehicles, addresses, financial references, and co-occurrence in case files — and presents matches with the underlying records for review.' },
  { q: 'Is legacy case data supported?', a: 'Yes. Existing FIR datasets can be migrated through a validated ETL pipeline with provenance tracking and rejection handling for malformed records.' },
]

const TYPED_QUERY = 'Are the Jayanagar snatching and Peenya extortion cases connected?'

/* ------------------------------ helpers ------------------------------ */

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.65, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : 0)
  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, reduce])
  return (
    <span ref={ref} className="tabular">
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}

function TypingDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()
  const [chars, setChars] = useState(reduce ? TYPED_QUERY.length : 0)
  useEffect(() => {
    if (!inView || reduce) return
    const t = setInterval(() => {
      setChars(c => {
        if (c >= TYPED_QUERY.length) { clearInterval(t); return c }
        return c + 1
      })
    }, 34)
    return () => clearInterval(t)
  }, [inView, reduce])
  const done = chars >= TYPED_QUERY.length
  return (
    <div ref={ref} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 shadow-sm">
      <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
      <span className="min-h-5 flex-1 text-sm text-slate-700">
        {TYPED_QUERY.slice(0, chars)}
        {!done && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-teal-500 align-middle" aria-hidden />}
      </span>
      <span className={cn('rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors', done ? 'bg-navy text-white' : 'bg-slate-100 text-slate-400')}>Ask</span>
    </div>
  )
}

/* ------------------------------ page ------------------------------ */

export function LandingPage() {
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const reduce = useReducedMotion()

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const shotRotate = useTransform(scrollYProgress, [0, 0.5], [10, 0])
  const shotY = useTransform(scrollYProgress, [0, 0.5], [0, -30])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.25])

  return (
    <div className="min-h-screen scroll-smooth bg-canvas text-slate-700">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/ksp-logo-official.png" alt="Karnataka State Police" width={38} height={42} className="object-contain" />
            <span className="font-display text-sm font-bold tracking-[0.22em] text-navy">KURUHU</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Landing navigation">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="text-[13px] font-medium text-slate-500 transition-colors hover:text-navy">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Link href="/signup/" className="inline-flex items-center rounded-lg border border-navy px-4 py-2 text-[13px] font-bold text-navy transition-all hover:-translate-y-px hover:bg-slate-50">
                  Sign up
                </Link>
                <Link href="/auth/" className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-[13px] font-bold text-white transition-all hover:-translate-y-px hover:bg-navy-700">
                  Sign in <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </>
            ) : (
              <Link href="/workspace/" className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-[13px] font-bold text-white transition-all hover:-translate-y-px hover:bg-navy-700">
                Command Centre <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ============================== HERO ============================== */}
      <section ref={heroRef} className="relative overflow-hidden">
        <motion.div style={reduce ? undefined : { opacity: glowOpacity }} className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-40 left-1/2 h-[30rem] w-[54rem] -translate-x-1/2 rounded-full bg-teal-100/60 blur-3xl" />
          <div className="absolute right-[-12rem] top-32 h-96 w-96 rounded-full bg-sky-100/70 blur-3xl" />
          <div className="absolute bottom-0 left-[-8rem] h-80 w-80 rounded-full bg-teal-50 blur-3xl" />
        </motion.div>
        <Constellation tone="light" className="pointer-events-none absolute inset-x-0 top-0 h-72 w-full opacity-70" />

        <div className="relative mx-auto max-w-6xl px-5 pt-24 text-center md:pt-32">
          <Reveal>
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-800">
              <ShieldCheck className="size-3.5 text-teal-600" aria-hidden /> Karnataka State Police · State Crime Records Bureau
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mx-auto mt-7 max-w-4xl font-display text-4xl font-bold leading-[1.06] tracking-tight text-navy md:text-[4.2rem]">
              Intelligence that{' '}
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">connects</span>{' '}
              investigations
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              KURUHU transforms fragmented case records into connected intelligence — FIRs, people, evidence, and
              relationships in one verified operational environment.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {!user ? (
                <>
                  <Link href="/signup/" className="inline-flex items-center rounded-lg border border-navy bg-white px-7 py-3.5 text-sm font-bold text-navy shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50">
                    Create account
                  </Link>
                  <Link href="/auth/" className="group inline-flex items-center gap-2 rounded-lg bg-navy px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy/20 transition-all hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-navy/30">
                    Sign in <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </>
              ) : (
                <Link href="/workspace/" className="group inline-flex items-center gap-2 rounded-lg bg-navy px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy/20 transition-all hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-navy/30">
                  Open Command Centre <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              )}
              <a href="#tour" className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-slate-50">
                <PlayCircle className="size-4 text-teal-600" aria-hidden /> Watch investigation flow
              </a>
            </div>
          </Reveal>

          {/* Hero screenshot with scroll parallax */}
          <div className="relative mx-auto mt-16 max-w-5xl" style={{ perspective: 1200 }}>
            <motion.div style={reduce ? undefined : { rotateX: shotRotate, y: shotY, transformStyle: 'preserve-3d' }}>
              <BrowserFrame src="/screens/dashboard.webp" alt="KURUHU Command Centre — live operational dashboard" priority glow="lg" />
            </motion.div>
            {/* floating chips */}
            <div className="animate-float-slow absolute -left-6 top-24 hidden rounded-xl border border-line bg-white px-4 py-3 shadow-xl lg:block" aria-hidden>
              <p className="flex items-center gap-2 text-xs font-bold text-navy"><Sparkles className="size-3.5 text-teal-600" /> AI finding verified</p>
              <p className="mt-1 text-[11px] text-slate-500">V-501 ↔ FIR 0232/2026 · 2 citations</p>
            </div>
            <div className="animate-float-slow absolute -right-8 top-52 hidden rounded-xl border border-line bg-white px-4 py-3 shadow-xl lg:block" style={{ animationDelay: '2.2s' }} aria-hidden>
              <p className="flex items-center gap-2 text-xs font-bold text-navy"><GitBranch className="size-3.5 text-teal-600" /> New relationship detected</p>
              <p className="mt-1 text-[11px] text-slate-500">Financial trail · 82% confidence</p>
            </div>
          </div>
        </div>

        {/* Marquee trust ribbon */}
        <div className="relative mt-20 border-y border-line bg-white py-3.5" aria-hidden>
          <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
              {[...RIBBON, ...RIBBON].map((item, i) => (
                <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span className="size-1 rounded-full bg-teal-500" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================== STATS ============================== */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-line px-5 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="px-6 py-12 text-center">
              <p className="font-display text-4xl font-bold tracking-tight text-navy md:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================== TOUR ============================== */}
      <section id="tour" className="py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">Platform tour</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-navy md:text-5xl">
              From raw reports to verified intelligence
            </h2>
          </Reveal>

          <div className="mt-20 space-y-28">
            {TOUR.map((t, i) => (
              <div key={t.eyebrow} id={i === 0 ? 'product' : undefined} className={cn('grid items-center gap-10 lg:grid-cols-12', i % 2 === 1 && 'lg:[direction:rtl]')}>
                <Reveal className="lg:col-span-5 lg:[direction:ltr]">
                  <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">
                    {i === 0 ? <FileText className="size-3.5" aria-hidden /> : i === 1 ? <Network className="size-3.5" aria-hidden /> : <BrainCircuit className="size-3.5" aria-hidden />}
                    {t.eyebrow}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-navy md:text-[2.1rem]">{t.title}</h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{t.desc}</p>
                  <ul className="mt-6 space-y-3">
                    {t.points.map(p => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden /> {p}
                      </li>
                    ))}
                  </ul>
                  {i === 2 && <div className="mt-7"><TypingDemo /></div>}
                </Reveal>
                <Reveal delay={0.12} className="lg:col-span-7 lg:[direction:ltr]">
                  <BrowserFrame src={t.img} alt={`${t.eyebrow} — KURUHU`} url={t.url} glow="md" className="transition-transform duration-500 hover:scale-[1.015]" />
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== BENTO ============================== */}
      <section className="border-t border-line bg-white py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">Capabilities</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-navy md:text-4xl">Built for the way investigations actually move</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-6">
            {/* FIR intelligence — wide with screenshot */}
            <Reveal className="group relative overflow-hidden rounded-2xl border border-line bg-canvas p-7 shadow-sm md:col-span-4">
              <FileText className="size-5 text-teal-600" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-semibold text-navy">FIR Intelligence</h3>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">Register, search, and manage FIRs as structured, connected records. Directory, workspace, and a guided 9-step creation wizard with autosave.</p>
              <div className="mt-6 overflow-hidden rounded-t-lg border border-line shadow-md transition-all duration-500 group-hover:-translate-y-1.5">
                <Image src="/screens/firs.webp" alt="FIR directory with filters and preview" width={2400} height={1500} className="w-full" sizes="(min-width: 768px) 60vw, 100vw" />
              </div>
            </Reveal>
            {/* Verification-first */}
            <Reveal delay={0.08} className="rounded-2xl border border-line bg-canvas p-7 shadow-sm md:col-span-2">
              <ShieldCheck className="size-5 text-teal-600" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-semibold text-navy">Human verification first</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">AI never decides. Every finding waits in a review queue until an officer verifies it against sources.</p>
              <div className="mt-6 space-y-2.5">
                {[['Awaiting verification', 'bg-amber-50 text-amber-800 border-amber-200'], ['Verified — audit logged', 'bg-emerald-50 text-emerald-800 border-emerald-200'], ['Rejected — re-analysis', 'bg-red-50 text-red-800 border-red-200']].map(([label, cls]) => (
                  <div key={label} className={cn('rounded-lg border px-3.5 py-2.5 text-xs font-semibold', cls)}>{label}</div>
                ))}
              </div>
            </Reveal>
            {/* Relationship discovery */}
            <Reveal className="rounded-2xl border border-line bg-canvas p-7 shadow-sm md:col-span-2">
              <GitBranch className="size-5 text-teal-600" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-semibold text-navy">Relationship discovery</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">Shared phones, vehicles, addresses, financial trails — surfaced automatically across cases.</p>
              <svg viewBox="0 0 220 90" className="mt-6 w-full" aria-hidden>
                <line x1="30" y1="45" x2="110" y2="20" stroke="rgba(13,148,136,0.45)" strokeWidth="1.5" />
                <line x1="30" y1="45" x2="110" y2="70" stroke="rgba(100,116,139,0.35)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="110" y1="20" x2="190" y2="45" stroke="rgba(13,148,136,0.45)" strokeWidth="1.5" />
                <line x1="110" y1="70" x2="190" y2="45" stroke="rgba(13,148,136,0.45)" strokeWidth="1.5" />
                <circle cx="30" cy="45" r="10" fill="#ffffff" stroke="#0d9488" strokeWidth="1.5" />
                <circle cx="110" cy="20" r="8" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
                <circle cx="110" cy="70" r="8" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
                <circle cx="190" cy="45" r="10" fill="#ffffff" stroke="#0d9488" strokeWidth="1.5" />
              </svg>
            </Reveal>
            {/* Global search */}
            <Reveal delay={0.06} className="rounded-2xl border border-line bg-canvas p-7 shadow-sm md:col-span-2">
              <Search className="size-5 text-teal-600" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-semibold text-navy">Instant global search</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">One command bar across FIR numbers, names, aliases, vehicles, and locations.</p>
              <div className="mt-6 flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2.5 text-xs text-slate-500 shadow-sm">
                <Search className="size-3.5" aria-hidden /> Ravi Anna
                <span className="ml-auto rounded border border-line px-1.5 py-0.5 text-[10px] font-bold text-slate-400">⌘K</span>
              </div>
              <p className="mt-2.5 rounded-lg bg-teal-50 px-3.5 py-2 text-[11px] font-medium text-teal-800">→ Ravi Kumar S · alias match · 3 linked FIRs</p>
            </Reveal>
            {/* Audit */}
            <Reveal delay={0.12} className="rounded-2xl border border-line bg-canvas p-7 shadow-sm md:col-span-2">
              <ScrollText className="size-5 text-teal-600" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-semibold text-navy">Tamper-evident audit</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">A permanent, searchable trail of every action — creations, edits, links, verifications.</p>
              <div className="mt-6 space-y-1.5 rounded-lg bg-navy p-3.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
                <p><span className="text-teal-400">21:05</span> ai.finding.generated → AI-01</p>
                <p><span className="text-teal-400">20:50</span> fir.updated → 0148/2026</p>
                <p><span className="text-teal-400">19:35</span> fir.created → 0251/2026</p>
              </div>
            </Reveal>
            {/* Languages */}
            <Reveal delay={0.18} className="rounded-2xl border border-line bg-canvas p-7 shadow-sm md:col-span-2">
              <Languages className="size-5 text-teal-600" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-semibold text-navy">Made for Karnataka</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">Kannada-first interface options, district-scoped workspaces, and BNS-aligned section libraries.</p>
              <p className="mt-6 font-display text-2xl font-bold text-navy">ಕುರುಹು</p>
              <p className="mt-1 text-xs text-slate-500">kuruhu — “the clue, the trace”</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================== HOW IT WORKS ============================== */}
      <section id="how-it-works" className="py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">How KURUHU works</p>
            <h2 className="mx-auto mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-navy md:text-4xl">Report to resolution, fully audited</h2>
          </Reveal>
          <div className="relative mt-16">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent md:block" aria-hidden />
            <ol className="grid gap-8 md:grid-cols-5">
              {[
                { n: '01', t: 'Report', d: 'Complaint captured with guided intake.' },
                { n: '02', t: 'FIR', d: 'A structured FIR becomes the core object.' },
                { n: '03', t: 'Intelligence', d: 'Records linked; AI surfaces patterns with citations.' },
                { n: '04', t: 'Verification', d: 'Officers verify findings against source records.' },
                { n: '05', t: 'Resolution', d: 'Charge sheets and closure — fully audited.' },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 0.1}>
                  <li className="relative text-center md:text-left">
                    <span className="relative z-10 mx-auto flex size-12 items-center justify-center rounded-full border border-teal-300 bg-white font-display text-sm font-bold text-teal-700 shadow-[0_0_24px_-6px_rgba(13,148,136,0.4)] md:mx-0">
                      {s.n}
                    </span>
                    <h3 className="mt-4 font-display text-[15px] font-semibold text-navy">{s.t}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{s.d}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============================== THE FORCE ============================== */}
      <section className="border-t border-line bg-white py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">The institution</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-navy md:text-4xl">Built with the force, for the force</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
              KURUHU is shaped by the officers who use it — from station house intake to command-level review —
              under the mandate of the Karnataka State Police, State Crime Records Bureau.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {/* Officers — large editorial photo */}
            <Reveal className="group relative overflow-hidden rounded-2xl border border-line shadow-md lg:col-span-2">
              <Image
                src="/photos/officers.jpg"
                alt="Karnataka State Police officers at a felicitation ceremony"
                width={1600}
                height={1000}
                className="h-full min-h-[22rem] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 66vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" aria-hidden />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="font-display text-lg font-bold text-white md:text-xl">Over 80,000 personnel. One source of truth.</p>
                <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-slate-300">
                  Designed for every rank and every station — the same verified record, from the constable
                  filing the intake to the analyst tracing the network.
                </p>
              </div>
            </Reveal>
            <div className="flex flex-col gap-4">
              {/* Leadership photo */}
              <Reveal delay={0.1} className="group relative flex-1 overflow-hidden rounded-2xl border border-line shadow-md">
                <Image
                  src="/photos/leadership.jpg"
                  alt="Senior Karnataka State Police leadership"
                  width={1200}
                  height={800}
                  className="h-full min-h-[13rem] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent" aria-hidden />
                <p className="absolute bottom-0 left-0 right-0 p-5 text-[13px] font-semibold leading-snug text-white">
                  Command accountability, by design<span className="mt-0.5 block text-[11px] font-medium text-slate-300">Supervisor review and charge approval are first-class workflows.</span>
                </p>
              </Reveal>
              {/* Emblem crest — deliberately dark */}
              <Reveal delay={0.18} className="flex items-center gap-5 rounded-2xl border border-white/10 bg-gradient-to-br from-navy-700 to-navy p-6 shadow-md">
                <Image src="/ksp-emblem.png" alt="Karnataka State Police emblem" width={84} height={98} className="shrink-0 object-contain drop-shadow-[0_0_18px_rgba(45,212,191,0.25)]" />
                <div>
                  <p className="font-display text-sm font-bold text-white">ಸತ್ಯಮೇವ ಜಯತೇ</p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-teal-300">Satyameva Jayate — truth alone triumphs</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-slate-400">Operating under the authority of the Karnataka State Police, Government of Karnataka.</p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== SECURITY ============================== */}
      <section id="security" className="py-28">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">Security & governance</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy md:text-4xl">Built for institutional trust</h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600">
                An intelligence platform for law enforcement has to be beyond question. KURUHU treats auditability
                and access control as product features, not afterthoughts.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {SECURITY.map(s => (
                  <div key={s.title} className="rounded-xl border border-line bg-white p-5 shadow-sm transition-colors hover:border-teal-300">
                    <s.icon className="size-5 text-teal-600" aria-hidden />
                    <h3 className="mt-2.5 font-display text-sm font-semibold text-navy">{s.title}</h3>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{s.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              {/* deliberately dark panel for contrast */}
              <div className="rounded-2xl border border-white/10 bg-navy p-7 shadow-2xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><ScrollText className="size-4 text-cyan" aria-hidden /> Live audit stream</div>
                <div className="mt-5 space-y-3">
                  {[
                    ['Insp. Meera Kulkarni', 'verified AI finding AI-02 against CCTV canvass notes', 'teal'],
                    ['ACP South Division', 'requested charge review for FIR 0219/2026', 'amber'],
                    ['PSI Divya R', 'linked evidence E-702 → FIR 0245/2026', 'teal'],
                    ['System', 'access denied — restricted record, logged & reported', 'red'],
                  ].map(([actor, action, tone], i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-white/10 bg-navy-800/70 px-4 py-3">
                      <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', tone === 'teal' ? 'bg-cyan' : tone === 'amber' ? 'bg-amber-400' : 'bg-red-400')} aria-hidden />
                      <p className="text-[13px] leading-relaxed text-slate-300"><span className="font-semibold text-white">{actor}</span> {action}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-[11px] text-slate-500">
                  <Lock className="size-3.5" aria-hidden /> Audit entries are append-only and cannot be edited or deleted by any role.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section id="faq" className="border-t border-line bg-white py-28">
        <div className="mx-auto max-w-3xl px-5">
          <Reveal className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy">Common questions</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-canvas shadow-sm">
              {FAQS.map((f, i) => (
                <div key={f.q}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-navy">{f.q}</span>
                    <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition-transform duration-300', openFaq === i && 'rotate-180 text-teal-600')} aria-hidden />
                  </button>
                  {openFaq === i && <p className="px-6 pb-6 text-sm leading-relaxed text-slate-600">{f.a}</p>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="py-24">
        <Reveal>
          {/* deliberately dark panel for the closing moment */}
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-cyan/25 bg-gradient-to-br from-steel via-navy-800 to-navy px-8 py-16 text-center shadow-2xl">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan/15 blur-3xl" aria-hidden />
            <div className="relative">
              <Users className="mx-auto size-8 text-cyan" aria-hidden />
              <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-white md:text-4xl">See the entire investigation.<br />Act with confidence.</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400">Authorised officers can sign in with their registered mobile number and district.</p>
              {!user ? (
                <Link href="/auth/" className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-cyan px-8 py-3.5 text-sm font-bold text-navy shadow-lg shadow-cyan/25 transition-all hover:-translate-y-0.5 hover:bg-teal-300">
                  Sign in to KURUHU <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              ) : (
                <Link href="/workspace/" className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-cyan px-8 py-3.5 text-sm font-bold text-navy shadow-lg shadow-cyan/25 transition-all hover:-translate-y-0.5 hover:bg-teal-300">
                  Open Command Centre <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-3">
            <Image src="/ksp-logo-official.png" alt="" width={34} height={38} className="object-contain" />
            <span className="text-xs text-slate-500">KURUHU · Karnataka State Police — State Crime Records Bureau</span>
          </div>
          <nav className="flex items-center gap-5" aria-label="Legal">
            <Link href="/support/" className="text-xs text-slate-500 transition-colors hover:text-navy">Support</Link>
            <Link href="/privacy/" className="text-xs text-slate-500 transition-colors hover:text-navy">Privacy</Link>
            <Link href="/terms/" className="text-xs text-slate-500 transition-colors hover:text-navy">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
