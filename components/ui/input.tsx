import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn('w-full rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/25 focus:ring-2 focus:ring-blue-400/50 focus:outline-none', className)} {...props} /> }
