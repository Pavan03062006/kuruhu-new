import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'

export function PageHeader({ title, description, actions, className }: { title: string; description?: string; actions?: ReactNode; className?: string }) {
  const { language, t } = useLanguage()

  const knTitles: Record<string, string> = {
    'Person Intelligence': 'ವ್ಯಕ್ತಿ ಬುದ್ಧಿಮತ್ತೆ (Person Intelligence)',
    'FIR Directory': 'ಎಫ್‌ಐಆರ್ ಸೂಚಿಕೆ ಮತ್ತು ಪಟ್ಟಿ',
    'Evidence & Relationship Graph': 'ಸಾಕ್ಷ್ಯ ಮತ್ತು ಸಂಬಂಧಿತ ಜಾಲ (Entity Graph)',
    'PRAMAAN AI Intelligence Hub': 'ಪ್ರಮಾಣ ಎಐ ಬುದ್ಧಿಮತ್ತೆ ಕೇಂದ್ರ',
    'AI Intelligence & Graph Investigator': 'ಎಐ ತನಿಖಾ ಕನ್ಸೋಲ್',
    'Activity & Audit Trail': 'ಚಟುವಟಿಕೆ ಮತ್ತು ಆಡಿಟ್ ಪಟ್ಟಿ',
    'Notifications': 'ಸೂಚನೆಗಳು ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು',
    'Settings': 'ಸಂಯೋಜನೆಗಳು (Settings)',
  }

  const displayTitle = language === 'kn' ? (knTitles[title] || t(title, title)) : title

  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{displayTitle}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
