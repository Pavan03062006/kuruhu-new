'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Loader2, Mail, MapPin, ScrollText, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useRouteTransition } from '@/components/providers/route-transition-provider'
import { DISTRICTS, LANGUAGES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const STEPS = ['Email', 'District', 'Language', 'Terms', 'Complete'] as const

export function AuthFlow() {
  const router = useRouter()
  const { startNavigation } = useRouteTransition()
  const { user, login } = useAuth()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [district, setDistrict] = useState('')
  const [districtQuery, setDistrictQuery] = useState('')
  const [districtOpen, setDistrictOpen] = useState(false)
  const [language, setLanguage] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredDistricts = useMemo(() => {
    const q = districtQuery.trim().toLowerCase()
    return q ? DISTRICTS.filter((d) => d.toLowerCase().includes(q)) : DISTRICTS
  }, [districtQuery])

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const canContinue = [emailValid, district !== '', language !== '', accepted && password.length >= 8, true][step]

  const next = async () => {
    setError(null)
    if (step === 0) {
      setStep(1)
      return
    }
    if (step === 3) {
      setSubmitting(true)
      try {
        await login({
          identifier: email.trim().toLowerCase(),
          credential: password,
          district,
          language,
          mode: 'psn_pin',
        })
        setStep(4)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Could not establish a session')
      } finally {
        setSubmitting(false)
      }
      return
    }
    if (step === 4) {
      startNavigation()
      router.replace('/workspace/')
      return
    }
    setStep((s) => s + 1)
  }

  return (
    <div className="bg-canvas flex min-h-screen">
      {/* Brand rail */}
      <aside className="bg-navy relative hidden w-[420px] shrink-0 flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="bg-steel/50 absolute top-1/3 -left-24 h-72 w-72 rounded-full blur-3xl" />
          <div className="bg-cyan/10 absolute right-[-4rem] bottom-10 h-56 w-56 rounded-full blur-3xl" />
        </div>
        <Link href="/" className="relative flex items-center gap-3">
          <Image src="/ksp-emblem.png" alt="Karnataka State Police" width={34} height={41} className="object-contain" />
          <span className="text-sm font-bold tracking-[0.22em] text-white">KURUHU</span>
        </Link>
        <div className="relative">
          <h1 className="text-3xl leading-tight font-bold text-white">Verified access to connected investigations.</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Sign in with your verified email address. Your session is bound to your district, role, and audit trail.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            New user?{' '}
            <Link href="/signup/" className="text-cyan font-semibold hover:underline">
              Create an account
            </Link>
          </p>
          <ul className="mt-8 space-y-3">
            {['Identity-verified sessions', 'District-scoped access', 'Every action logged'].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <ShieldCheck className="text-cyan size-4" aria-hidden /> {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[11px] text-slate-500">Karnataka State Police — State Crime Records Bureau</p>
      </aside>

      {/* Flow */}
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          {/* Stepper */}
          <ol
            className="mb-10 flex items-center gap-1.5"
            aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
          >
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 flex-col gap-1.5">
                <span
                  className={cn(
                    'h-1 rounded-full transition-colors',
                    i < step ? 'bg-cyan-600' : i === step ? 'bg-navy' : 'bg-line',
                  )}
                />
                <span
                  className={cn('hidden text-[10px] font-medium sm:block', i === step ? 'text-ink' : 'text-ink-muted')}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>

          {step === 0 && (
            <section aria-labelledby="step-email">
              {user && (
                <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900 shadow-sm">
                  <p className="font-bold">Active Session Found</p>
                  <p className="mt-1 text-xs text-teal-700">
                    Signed in as <strong>{user.display_name}</strong> ({user.district}).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      startNavigation()
                      router.replace('/workspace/')
                    }}
                    className="bg-navy hover:bg-navy-700 mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition-all"
                  >
                    Go to Command Centre <ArrowRight className="size-3.5" aria-hidden />
                  </button>
                </div>
              )}
              <span className="bg-navy text-cyan inline-flex size-11 items-center justify-center rounded-xl">
                <Mail className="size-5" aria-hidden />
              </span>
              <h2 id="step-email" className="text-ink mt-5 text-2xl font-bold tracking-tight">
                Enter your email address
              </h2>
              <p className="text-ink-muted mt-1.5 text-sm">
                Use the verified email address registered with your account.
              </p>
              <label
                className="text-ink-muted mt-7 block text-xs font-semibold tracking-wide uppercase"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError(null)
                }}
                placeholder="officer@example.gov.in"
                className="border-line text-ink focus:ring-cyan mt-1.5 h-12 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2"
              />
              {email !== '' && !emailValid && (
                <p className="mt-1.5 text-xs text-red-600">Enter a valid email address.</p>
              )}
            </section>
          )}

          {step === 1 && (
            <section aria-labelledby="step-district">
              <span className="bg-navy text-cyan inline-flex size-11 items-center justify-center rounded-xl">
                <MapPin className="size-5" aria-hidden />
              </span>
              <h2 id="step-district" className="text-ink mt-5 text-2xl font-bold tracking-tight">
                Select your district
              </h2>
              <p className="text-ink-muted mt-1.5 text-sm">Your workspace is scoped to your posted district unit.</p>
              <label
                className="text-ink-muted mt-7 block text-xs font-semibold tracking-wide uppercase"
                htmlFor="district"
              >
                District
              </label>
              <div className="relative mt-1.5">
                <button
                  id="district"
                  type="button"
                  onClick={() => setDistrictOpen((o) => !o)}
                  aria-expanded={districtOpen}
                  aria-haspopup="listbox"
                  className="border-line text-ink focus:ring-cyan flex h-12 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm focus:ring-2 focus:outline-none"
                >
                  <span className={district ? '' : 'text-slate-400'}>{district || 'Search districts…'}</span>
                  <ChevronDown
                    className={cn('size-4 text-slate-400 transition-transform', districtOpen && 'rotate-180')}
                    aria-hidden
                  />
                </button>
                {districtOpen && (
                  <div className="border-line absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border bg-white shadow-xl">
                    <input
                      autoFocus
                      value={districtQuery}
                      onChange={(e) => setDistrictQuery(e.target.value)}
                      placeholder="Type to filter…"
                      className="border-line h-10 w-full border-b px-3 text-sm outline-none placeholder:text-slate-400"
                      aria-label="Filter districts"
                    />
                    <ul role="listbox" aria-label="Districts" className="max-h-56 scrollbar-thin overflow-y-auto p-1">
                      {filteredDistricts.length === 0 && (
                        <li className="text-ink-muted px-3 py-4 text-center text-xs">No district matches.</li>
                      )}
                      {filteredDistricts.map((d) => (
                        <li key={d} role="option" aria-selected={district === d}>
                          <button
                            type="button"
                            onClick={() => {
                              setDistrict(d)
                              setDistrictOpen(false)
                              setDistrictQuery('')
                            }}
                            className={cn(
                              'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm',
                              district === d ? 'bg-navy text-white' : 'text-ink hover:bg-canvas',
                            )}
                          >
                            {d}
                            {district === d && <Check className="size-4" aria-hidden />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="step-language">
              <span className="bg-navy text-cyan inline-flex size-11 items-center justify-center rounded-xl">
                <ScrollText className="size-5" aria-hidden />
              </span>
              <h2 id="step-language" className="text-ink mt-5 text-2xl font-bold tracking-tight">
                Choose your language
              </h2>
              <p className="text-ink-muted mt-1.5 text-sm">KURUHU will use this language across the workspace.</p>
              <div className="mt-7 grid gap-2.5" role="radiogroup" aria-label="Language">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    role="radio"
                    aria-checked={language === l.code}
                    onClick={() => setLanguage(l.code)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-4 py-3.5 text-left text-sm font-medium transition-colors',
                      language === l.code
                        ? 'border-navy bg-navy text-white'
                        : 'border-line text-ink bg-white hover:border-slate-300',
                    )}
                  >
                    {l.label}
                    {language === l.code && <Check className="text-cyan size-4" aria-hidden />}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="step-terms">
              <span className="bg-navy text-cyan inline-flex size-11 items-center justify-center rounded-xl">
                <ShieldCheck className="size-5" aria-hidden />
              </span>
              <h2 id="step-terms" className="text-ink mt-5 text-2xl font-bold tracking-tight">
                Terms of authorised use
              </h2>
              <div className="border-line mt-6 max-h-52 scrollbar-thin space-y-3 overflow-y-auto rounded-lg border bg-white p-4 text-[13px] leading-relaxed text-slate-600">
                <p>KURUHU is restricted to authorised law-enforcement personnel. By continuing you acknowledge that:</p>
                <p>
                  1. All activity in this system — searches, record views, edits, links, and verifications — is logged
                  to a permanent audit trail attributed to your identity.
                </p>
                <p>
                  2. AI-generated findings are investigative assistance only. They are not evidence and must be verified
                  against source records before any action.
                </p>
                <p>
                  3. Case data is confidential. Access, use, and disclosure are governed by departmental policy and
                  applicable law.
                </p>
                <p>
                  4. Misuse of this system, including unauthorised access or disclosure, is subject to disciplinary and
                  legal action.
                </p>
              </div>
              <label className="border-line mt-5 flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-4">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 size-4 accent-teal-600"
                />
                <span className="text-ink text-sm">I have read and accept the terms of authorised use.</span>
              </label>
              <label
                className="text-ink-muted mt-4 block text-xs font-semibold tracking-wide uppercase"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError(null)
                }}
                placeholder="Enter your password"
                className="border-line text-ink focus:ring-cyan mt-1.5 h-12 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2"
              />
              {password !== '' && password.length < 8 && (
                <p className="mt-1.5 text-xs text-red-600">Password must contain at least 8 characters.</p>
              )}
              {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
              <p className="text-ink-muted mt-4 text-sm">
                Don&rsquo;t have an account?{' '}
                <Link href="/signup/" className="font-semibold text-cyan-700 hover:underline">
                  Sign up with your email
                </Link>
              </p>
            </section>
          )}

          {step === 4 && (
            <section aria-labelledby="step-done" className="text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="size-8" aria-hidden />
              </span>
              <h2 id="step-done" className="text-ink mt-6 text-2xl font-bold tracking-tight">
                You&rsquo;re verified
              </h2>
              <p className="text-ink-muted mx-auto mt-2 max-w-sm text-sm">
                Session established for <span className="text-ink font-semibold">{email.trim().toLowerCase()}</span> ·{' '}
                {district}. Opening your Command Centre.
              </p>
            </section>
          )}

          {/* Controls */}
          <div className="mt-9 flex items-center justify-between">
            {step > 0 && step < 4 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white"
              >
                <ArrowLeft className="size-4" aria-hidden /> Back
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={next}
              disabled={!canContinue || submitting}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all',
                canContinue && !submitting
                  ? 'bg-navy hover:bg-navy-700 text-white shadow-sm'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400',
              )}
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {step === 3 ? 'Verify & continue' : step === 4 ? 'Enter Command Centre' : 'Continue'}
              {!submitting && <ArrowRight className="size-4" aria-hidden />}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
