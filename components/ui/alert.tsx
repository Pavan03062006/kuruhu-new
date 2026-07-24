import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div role="alert" className={cn('rounded-xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-100', className)} {...props} /> }
