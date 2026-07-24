import Image from 'next/image'
import { cn } from '@/lib/utils'

/** A product screenshot inside a realistic dark browser chrome with a cyan glow. */
export function BrowserFrame({
  src, alt, url = 'kuruhu.ksp.gov.in/workspace', priority = false, glow = 'md', className,
}: {
  src: string
  alt: string
  url?: string
  priority?: boolean
  glow?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const glowCls = {
    sm: 'shadow-[0_0_50px_-12px_rgba(45,212,191,0.25)]',
    md: 'shadow-[0_0_90px_-15px_rgba(45,212,191,0.35)]',
    lg: 'shadow-[0_0_140px_-20px_rgba(45,212,191,0.45)]',
  }[glow]
  return (
    <figure className={cn('overflow-hidden rounded-xl border border-white/10 bg-navy-800', glowCls, className)}>
      <div className="flex items-center gap-2 border-b border-white/10 bg-navy-700/70 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-emerald-400/70" />
        </span>
        <span className="mx-auto flex items-center gap-1.5 rounded-md bg-navy/70 px-3 py-1 text-[11px] font-medium text-slate-400">
          <svg className="size-3 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          {url}
        </span>
      </div>
      <Image src={src} alt={alt} width={2400} height={1500} priority={priority} className="w-full" sizes="(min-width: 1024px) 60vw, 100vw" />
    </figure>
  )
}
