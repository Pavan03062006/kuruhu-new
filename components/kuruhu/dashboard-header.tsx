'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, MapPin, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'

export function DashboardHeader() {
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setNow(new Date()), 0)
    const tick = setInterval(() => setNow(new Date()), 60_000)
    return () => { clearTimeout(t); clearInterval(tick) }
  }, [])

  const hour = now?.getHours() ?? 9
  const greeting =
    language === 'kn'
      ? hour < 12
        ? 'ಶುಭೋದಯ ಸಾಬ್'
        : hour < 17
        ? 'ಮಧ್ಯಾಹ್ನದ ಶುಭಾಶಯಗಳು ಸಾಬ್'
        : 'ಶುಭ ಸಂಜೆ ಸಾಬ್'
      : hour < 12
      ? 'Good morning'
      : hour < 17
      ? 'Good afternoon'
      : 'Good evening'

  const dateLabel = now
    ? now.toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    : '—'

  const displayName = user?.display_name || (language === 'kn' ? 'ತನಿಖಾಧಿಕಾರಿ ಸಾಬ್' : 'Investigating Officer')
  const userStation = user?.station || 'Jayanagar PS'
  const userDistrict = user?.district || 'Bengaluru (Urban)'

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          {language === 'kn'
            ? 'ಕರ್ನಾಟಕ ಪೋಲೀಸ್ ಕಮಾಂಡ್ ಸೆಂಟರ್'
            : user?.role === 'admin'
            ? 'Administrative Control Centre'
            : user?.role === 'civilian'
            ? 'Citizen Public Portal'
            : 'Police Command Centre'}
        </p>
        <h1 className="mt-1.5 font-display text-[1.7rem] font-bold tracking-tight text-ink">
          {greeting}, {displayName}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden />{dateLabel}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden />{userStation} · {userDistrict}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 ring-1 ring-inset ring-teal-200">
            <ShieldCheck className="size-3 text-teal-600" aria-hidden />
            {language === 'kn' ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ · ಆಡಿಟ್ ಮಾಡಲಾಗಿದೆ' : 'Authenticated · Session Audited'}
          </span>
        </div>
      </div>
    </div>
  )
}
