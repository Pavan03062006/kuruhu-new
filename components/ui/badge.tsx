import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span className={cn('inline-flex rounded-full border border-blue-400/20 bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-200', className)} {...props} /> }
