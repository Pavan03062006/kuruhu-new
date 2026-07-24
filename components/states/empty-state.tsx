import { Building2 } from 'lucide-react'

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <section className="rounded-3xl border border-white/15 bg-white/[0.07] p-10 text-center shadow-2xl backdrop-blur-xl md:p-16"><div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300"><Building2 /></div><h1 className="text-2xl font-bold md:text-3xl">{title}</h1><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-100/60 md:text-base">{description}</p><div className="mx-auto mt-8 h-px max-w-md bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" /></section>
}
