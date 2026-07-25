'use client'

import { useState } from 'react'
import { Bell, Globe, Laptop, Lock, Palette, ScrollText, Smartphone, User } from 'lucide-react'
import { PageHeader } from '@/components/kuruhu/page-header'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'language', label: 'Language & Locale', icon: Globe },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'sessions', label: 'Active sessions', icon: Laptop },
  { key: 'audit', label: 'Audit preferences', icon: ScrollText },
] as const

type SectionKey = (typeof SECTIONS)[number]['key']

function Toggle({ label, desc, defaultOn = true }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-ink-muted">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn(v => !v)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-teal-500' : 'bg-slate-300')}
      >
        <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', on ? 'left-[1.4rem]' : 'left-0.5')} />
      </button>
    </div>
  )
}

export function SettingsPanel() {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [section, setSection] = useState<SectionKey>('profile')

  const displayName = user?.display_name || 'Investigating Officer'
  const userRole = user?.role === 'admin' ? 'System Administrator' : user?.role === 'civilian' ? 'Citizen' : 'Investigating Officer'
  const badge = user?.badge_number || 'KSP-30412'
  const station = user?.station || 'Jayanagar PS'
  const district = user?.district || 'Bengaluru (Urban)'

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'US'

  return (
    <>
      <PageHeader
        title={t('nav.settings', 'Settings')}
        description={
          language === 'kn'
            ? 'ನಿಮ್ಮ ಖಾತೆಯ ಪ್ರೊಫೈಲ್, ಭಾಷೆ (Language), ಭದ್ರತೆ ಮತ್ತು ಆಡಿಟ್ ಆದ್ಯತೆಗಳು.'
            : 'Profile, security, language, appearance, and audit preferences for your account.'
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <nav aria-label="Settings sections" className="space-y-0.5">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              aria-current={section === s.key ? 'page' : undefined}
              className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors', section === s.key ? 'bg-navy text-white' : 'text-ink-muted hover:bg-white hover:text-ink')}
            >
              <s.icon className={cn('size-4', section === s.key && 'text-cyan')} aria-hidden /> {s.label}
            </button>
          ))}
        </nav>

        <div className="lg:col-span-3">
          <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
            {section === 'profile' && (
              <>
                <h2 className="text-lg font-bold text-ink">Profile Information</h2>
                <div className="mt-5 flex items-center gap-4">
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-steel text-xl font-bold text-white">{initials}</span>
                  <div>
                    <p className="text-base font-bold text-ink">{displayName}</p>
                    <p className="text-sm text-ink-muted">{userRole} · Badge/ID {badge}</p>
                  </div>
                </div>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Station / Unit</dt><dd className="mt-0.5 font-medium text-ink">{station}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">District</dt><dd className="mt-0.5 font-medium text-ink">{district}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Role Context</dt><dd className="mt-0.5 font-medium capitalize text-ink">{user?.role || 'officer'}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Language</dt><dd className="mt-0.5 font-medium text-ink">{language === 'kn' ? 'ಕನ್ನಡ — Kannada' : 'English'}</dd></div>
                </dl>
              </>
            )}

            {section === 'language' && (
              <>
                <h2 className="text-lg font-bold text-ink">{t('settings.langTitle', 'Dashboard Platform Language')}</h2>
                <p className="mt-1 text-xs text-ink-muted">
                  {t('settings.langDesc', 'Toggle the entire KURUHU PRAMAAN workspace interface between English and Kannada.')}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl p-5 border transition-all text-center',
                      language === 'en'
                        ? 'border-navy bg-navy/5 ring-2 ring-navy'
                        : 'border-line bg-canvas hover:border-slate-400'
                    )}
                  >
                    <span className="text-2xl font-black text-navy">English</span>
                    <span className="mt-1 text-xs text-slate-500">Standard English Workspace</span>
                    {language === 'en' && <span className="mt-2 rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">Active</span>}
                  </button>

                  <button
                    onClick={() => setLanguage('kn')}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl p-5 border transition-all text-center',
                      language === 'kn'
                        ? 'border-cyan-600 bg-cyan/10 ring-2 ring-cyan-600'
                        : 'border-line bg-canvas hover:border-slate-400'
                    )}
                  >
                    <span className="text-2xl font-black text-navy">ಕನ್ನಡ</span>
                    <span className="mt-1 text-xs text-slate-500">Kannada Regional Workspace</span>
                    {language === 'kn' && <span className="mt-2 rounded-full bg-cyan-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">ಸಕ್ರಿಯ (Active)</span>}
                  </button>
                </div>
              </>
            )}

            {section === 'notifications' && (
              <>
                <h2 className="text-lg font-bold text-ink">Notifications</h2>
                <div className="mt-4 divide-y divide-line">
                  <Toggle label="AI verification queue" desc="Alert when a new AI finding awaits your review." />
                  <Toggle label="Case assignments" desc="Alert when an FIR is assigned to you or your station." />
                  <Toggle label="Deadlines & reviews" desc="Reminders for charge reviews and court dates." />
                </div>
              </>
            )}

            {section === 'security' && (
              <>
                <h2 className="text-lg font-bold text-ink">Security</h2>
                <div className="mt-4 divide-y divide-line">
                  <Toggle label="Two-step verification" desc="Require OTP on every new device sign-in." />
                  <Toggle label="Auto sign-out" desc="End the session after 30 minutes of inactivity." />
                </div>
              </>
            )}

            {section === 'appearance' && (
              <>
                <h2 className="text-lg font-bold text-ink">Appearance</h2>
                <div className="mt-4 divide-y divide-line">
                  <Toggle label="Compact density" desc="Show more records per screen in directories." defaultOn={false} />
                </div>
              </>
            )}

            {section === 'sessions' && (
              <>
                <h2 className="text-lg font-bold text-ink">Active sessions</h2>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center gap-3 rounded-lg border border-line bg-canvas p-4">
                    <Laptop className="size-5 text-slate-500" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">Active PRAMAAN Web Session</p>
                      <p className="text-xs text-ink-muted">{district} · Active Now</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">Current</span>
                  </li>
                </ul>
              </>
            )}

            {section === 'audit' && (
              <>
                <h2 className="text-lg font-bold text-ink">Audit preferences</h2>
                <p className="mt-1.5 text-sm text-ink-muted">Audit logging is mandatory for governance and accountability.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
