import type { DialogHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Dialog({ title, children, className, ...props }: DialogHTMLAttributes<HTMLDialogElement> & { title: string; children: ReactNode }) { return <dialog aria-labelledby="dialog-title" className={cn('m-auto max-w-lg rounded-2xl border border-white/20 bg-[#0f2844] p-6 text-white shadow-2xl backdrop:bg-black/70', className)} {...props}><h2 id="dialog-title" className="text-xl font-semibold">{title}</h2><div className="mt-4 text-white/70">{children}</div></dialog> }
