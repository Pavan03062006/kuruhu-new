'use client'

import { useState, type ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { TopNavigation } from './top-navigation'
import { AiChatbot } from '@/components/kuruhu/ai-chatbot'

export function ApplicationShell({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavigation onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />
        <main className="flex-1 px-3 py-4 sm:px-6 md:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
      <AiChatbot />
    </div>
  )
}
