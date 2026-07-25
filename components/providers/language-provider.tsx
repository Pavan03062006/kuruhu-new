'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Language = 'en' | 'kn'

export const TRANSLATIONS: Record<string, { en: string; kn: string }> = {
  // Nav
  'nav.dashboard': { en: 'Dashboard', kn: 'ಮುಖಪುಟ' },
  'nav.firs': { en: 'FIR Directory', kn: 'ಎಫ್‌ಐಆರ್ ಪಟ್ಟಿ' },
  'nav.persons': { en: 'Person Intelligence', kn: 'ವ್ಯಕ್ತಿ ಬುದ್ಧಿಮತ್ತೆ' },
  'nav.graph': { en: 'Evidence Graph', kn: 'ಸಾಕ್ಷ್ಯ ಸಂಶೋಧನಾ ಜಾಲ' },
  'nav.ai': { en: 'AI Investigator', kn: 'ಎಐ ಪರಿಶೋಧಕ Hub' },
  'nav.activity': { en: 'Audit & Activity', kn: 'ಆಡಿಟ್ & ಚಟುವಟಿಕೆ' },
  'nav.notifications': { en: 'Notifications', kn: 'ಸೂಚನೆಗಳು' },
  'nav.settings': { en: 'Settings', kn: 'ಸಂಯೋಜನೆಗಳು' },

  // Header & Search
  'header.portal': { en: 'Police Intelligence', kn: 'ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ಬುದ್ಧಿಮತ್ತೆ' },
  'header.search': { en: 'Search FIRs, suspects, vehicles…', kn: 'ಎಫ್‌ಐಆರ್, ಶಂಕಿತರು, ವಾಹನಗಳನ್ನು ಹುಡುಕಿ…' },
  'header.createFir': { en: 'Create FIR', kn: 'ಹೊಸ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸಿ' },
  'header.commandCentre': { en: 'Police Command Centre', kn: 'ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ಕಮಾಂಡ್ ಸೆಂಟರ್' },
  'header.goodMorning': { en: 'Good morning', kn: 'ಶುಭೋದಯ ಸಾಬ್' },
  'header.goodAfternoon': { en: 'Good afternoon', kn: 'ಮಧ್ಯಾಹ್ನದ ಶುಭಾಶಯಗಳು' },
  'header.goodEvening': { en: 'Good evening', kn: 'ಶುಭ ಸಂಜೆ ಸಾಬ್' },
  'header.authenticated': { en: 'Authenticated · Session Audited', kn: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ · ಆಡಿಟ್ ಪೂರ್ಣಗೊಂಡಿದೆ' },

  // Dashboard Metrics
  'dash.activeFirs': { en: 'Active FIRs', kn: 'ಸಕ್ರಿಯ ಎಫ್‌ಐಆರ್‌ಗಳು' },
  'dash.pendingReviews': { en: 'Pending reviews', kn: 'ಬಾಕಿ ಪರಿಶೀಲನೆಗಳು' },
  'dash.linkedPersons': { en: 'Linked persons', kn: 'ಸಂಪರ್ಕಿತ ವ್ಯಕ್ತಿಗಳು' },
  'dash.aiFindingsToVerify': { en: 'AI findings to verify', kn: 'ಎಐ ಪರಿಶೋಧನೆಗಳ ಪರಿಶೀಲನೆ' },
  'dash.priorityFirs': { en: 'Priority FIRs', kn: 'ಆಧ್ಯತೆಯ ಪ್ರಕರಣಗಳು' },

  // Dashboard Actions & Panels
  'dash.quickActions': { en: 'Quick Actions', kn: 'ತ್ವರಿತ ಕ್ರಮಗಳು' },
  'dash.createFirDesc': { en: 'Guided 9-step intake', kn: 'ಹೊಸ ದೂರು ದಾಖಲಾತಿ' },
  'dash.searchFirDesc': { en: 'Directory & filters', kn: 'ಪ್ರಕರಣಗಳ ಶೋಧನೆ' },
  'dash.openGraphDesc': { en: 'Entity relationships', kn: 'ಶಂಕಿತರ ಜಾಲ ನಕ್ಷೆ' },
  'dash.aiInvestigatorDesc': { en: 'Ask in plain language', kn: 'ಎಐ ನೇರ ಶೋಧನೆ' },
  'dash.priorityHeading': { en: 'Priority cases (Live from Supabase)', kn: 'ಆದ್ಯತೆಯ ಪ್ರಕರಣಗಳು (ನೇರ ಪ್ರಸಾರ)' },
  'dash.viewAllFirs': { en: 'View all FIRs →', kn: 'ಎಲ್ಲಾ ಎಫ್‌ಐಆರ್ ನೋಡಿ →' },
  'dash.aiVerificationQueue': { en: 'AI verification queue', kn: 'ಎಐ ಪರಿಶೀಲನಾ ಸಾಲು' },
  'dash.openAiInvestigator': { en: 'Open AI Investigator →', kn: 'ಎಐ ಪರಿಶೋಧಕ ತೆರೆಯಿರಿ →' },
  'dash.actionRequired': { en: 'Action required', kn: 'ಅಗತ್ಯವಿರುವ ತಕ್ಷಣದ ಕ್ರಮಗಳು' },
  'dash.reviewVerify': { en: 'Review & verify', kn: 'ಪರಿಶೀಲಿಸಿ ದೃಢೀಕರಿಸಿ' },

  // Person Directory
  'person.title': { en: 'Person Intelligence', kn: 'ವ್ಯಕ್ತಿ ಬುದ್ಧಿಮತ್ತೆ' },
  'person.desc': { en: 'Search people across investigations by name, alias, phone, or identifier.', kn: 'ಹೆಸರು, ಅಲಿಯಾಸ್, ಫೋನ್ ಸಂಖ್ಯೆ ಅಥವಾ ಗುರುತಿನ ಚೀಟಿಯ ಮೂಲಕ ವ್ಯಕ್ತಿಗಳನ್ನು ಹುಡುಕಿ.' },
  'person.searchPlaceholder': { en: 'Name, alias, phone, identifier…', kn: 'ಹೆಸರು, ಅಲಿಯಾಸ್, ಫೋನ್, ಐಡಿ…' },

  // AI Hub
  'ai.title': { en: 'PRAMAAN AI Intelligence Hub', kn: 'ಪ್ರಮಾಣ ಎಐ ಬುದ್ಧಿಮತ್ತೆ ಕೇಂದ್ರ' },
  'ai.desc': { en: 'Crime Pattern Discovery, Spatial Hotspot Detection, Predictive Early Warnings & Proactive Crime Prevention.', kn: 'ಅಪರಾಧ ಶೈಲಿ ಪತ್ತೆ, ತಾಣಗಳ ನಕ್ಷೆ (Hotspots), ಪೂರ್ವಭಾವಿ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು & ಗಸ್ತು ಮಾರ್ಗಗಳು.' },

  // Settings
  'settings.langTitle': { en: 'Dashboard Platform Language', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವ್ಯವಸ್ಥೆಯ ಭಾಷೆ' },
  'settings.langDesc': { en: 'Toggle the entire KURUHU PRAMAAN workspace interface between English and Kannada.', kn: 'ಸಂಪೂರ್ಣ ಕುರುಹು ಪ್ರಮಾಣ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಸಂಪರ್ಕಸಾಧನವನ್ನು ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡದ ನಡುವೆ ಬದಲಾಯಿಸಿ.' },
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, defaultText?: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key, defaultText) => defaultText || key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('pramaan_lang') as Language
    if (saved === 'en' || saved === 'kn') {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('pramaan_lang', lang)
  }

  const t = (key: string, defaultText?: string): string => {
    const entry = TRANSLATIONS[key]
    if (entry) {
      return entry[language] || entry.en
    }
    return defaultText || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
