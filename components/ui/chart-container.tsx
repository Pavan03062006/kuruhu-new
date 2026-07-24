import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function ChartContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div role="img" className={cn('min-h-72 rounded-2xl border border-white/10 bg-white/[0.04] p-4', className)} {...props} /> }
