'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, Loader2, Mail, ShieldCheck, UserPlus } from 'lucide-react'
import { useAuth } from '@/features/auth/components/auth-provider'
import { DISTRICTS, LANGUAGES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function SignupFlow() {
  const router = useRouter()
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [district, setDistrict] = useState('')
  const [language, setLanguage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const passwordValid = password.length >= 8
  const passwordsMatch = password === confirmPassword
  const canSubmit = emailValid && district !== '' && language !== '' && passwordValid && passwordsMatch && accepted

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      const result = await signup({ email, password, district, language })
      if (result.requiresEmailVerification) setVerificationSent(true)
      else router.replace('/workspace')
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not create your account'
      setError(
        message.toLowerCase().includes('rate limit')
          ? 'The verification email limit has been reached. Please wait before trying again, or contact an administrator.'
          : message,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="relative hidden w-[420px] shrink-0 flex-col justify-between overflow-hidden bg-navy p-10 lg:flex">
        <Link href="/" className="relative flex items-center gap-3">
          <Image src="/ksp-emblem.png" alt="Karnataka State Police" width={34} height={41} className="object-contain" />
          <span className="text-sm font-bold tracking-[0.22em] text-white">KURUHU</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold leading-tight text-white">Create your secure investigation account.</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">Register with your official email address and verify it before entering the workspace.</p>
          <ul className="mt-8 space-y-3">
            {['Verified email identity', 'District-scoped workspace', 'Auditable user sessions'].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <ShieldCheck className="size-4 text-cyan" aria-hidden /> {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-slate-500">Karnataka State Police — State Crime Records Bureau</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <form onSubmit={submit} className="w-full max-w-md">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-navy text-cyan"><UserPlus className="size-5" aria-hidden /></span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink">Create your account</h2>
          <p className="mt-1.5 text-sm text-ink-muted">Register with your email address and a password.</p>

          <label className="mt-7 block text-xs font-semibold uppercase tracking-wide text-ink-muted" htmlFor="signup-email">Email address</label>
          <input id="signup-email" type="email" autoComplete="email" value={email}
            onChange={event => { setEmail(event.target.value); setError(null) }} placeholder="officer@example.gov.in"
            className="mt-1.5 h-12 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-cyan" />
          {email !== '' && !emailValid && <p className="mt-1.5 text-xs text-red-600">Enter a valid email address.</p>}

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-muted" htmlFor="signup-district">District</label>
          <div className="relative mt-1.5">
            <select id="signup-district" value={district} onChange={event => setDistrict(event.target.value)}
              className="h-12 w-full appearance-none rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-cyan">
              <option value="">Select your district</option>
              {DISTRICTS.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-4 size-4 text-slate-400" aria-hidden />
          </div>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-muted" htmlFor="signup-language">Language</label>
          <div className="relative mt-1.5">
            <select id="signup-language" value={language} onChange={event => setLanguage(event.target.value)}
              className="h-12 w-full appearance-none rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-cyan">
              <option value="">Choose your language</option>
              {LANGUAGES.map(item => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-4 size-4 text-slate-400" aria-hidden />
          </div>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-muted" htmlFor="signup-password">Password</label>
          <input id="signup-password" type="password" autoComplete="new-password" value={password}
            onChange={event => { setPassword(event.target.value); setError(null) }} placeholder="At least 8 characters"
            className="mt-1.5 h-12 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-cyan" />

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-muted" htmlFor="signup-confirm">Confirm password</label>
          <input id="signup-confirm" type="password" autoComplete="new-password" value={confirmPassword}
            onChange={event => { setConfirmPassword(event.target.value); setError(null) }} placeholder="Re-enter your password"
            className="mt-1.5 h-12 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-cyan" />
          {confirmPassword !== '' && !passwordsMatch && <p className="mt-1.5 text-xs text-red-600">Passwords do not match.</p>}

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-4">
            <input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-0.5 size-4 accent-teal-600" />
            <span className="text-sm text-ink">I confirm that I am an authorised user and accept the terms of use.</span>
          </label>

          {verificationSent && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Account created. Open the verification link sent to <strong>{email.trim().toLowerCase()}</strong>, then sign in.
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={!canSubmit || submitting || verificationSent}
            className={cn('mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-all',
              canSubmit && !submitting && !verificationSent ? 'bg-navy text-white hover:bg-navy-700' : 'cursor-not-allowed bg-slate-200 text-slate-400')}>
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Mail className="size-4" aria-hidden />}
            {verificationSent ? 'Verification email sent' : 'Create account'}
            {!submitting && !verificationSent && <Check className="size-4" aria-hidden />}
          </button>

          <p className="mt-5 text-center text-sm text-ink-muted">
            Already verified? <Link href="/auth" className="font-semibold text-cyan-700 hover:underline">Sign in</Link>
          </p>
        </form>
      </main>
    </div>
  )
}
