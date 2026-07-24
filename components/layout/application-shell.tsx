import type { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { TopNavigation } from './top-navigation'
import { AiChatbot } from '@/components/kuruhu/ai-chatbot'

export function ApplicationShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavigation />
        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
      <AiChatbot />
    </div>
  )
}
