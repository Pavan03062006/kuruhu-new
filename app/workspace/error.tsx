'use client'

import { AlertTriangle } from 'lucide-react'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-8 text-center"><AlertTriangle className="mx-auto mb-4 text-red-300" /><h2 className="text-xl font-semibold">Unable to load this area</h2><p className="mt-2 text-sm text-white/60">The error was contained. You can safely try again.</p><button onClick={reset} className="mt-6 rounded-lg bg-blue-600 px-4 py-2 font-medium">Try again</button></div>
}
