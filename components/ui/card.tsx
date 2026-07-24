import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('rounded-2xl border border-white/15 bg-white/[0.07] shadow-xl backdrop-blur-xl', className)} {...props} /> }
