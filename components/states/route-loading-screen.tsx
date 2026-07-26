import Image from 'next/image'

type RouteLoadingScreenProps = {
  overlay?: boolean
  message?: string
}

export function RouteLoadingScreen({
  overlay = false,
  message = 'Loading secure workspace…',
}: RouteLoadingScreenProps) {
  return (
    <div
      className={
        overlay
          ? 'bg-navy/95 fixed inset-0 z-[100] flex min-h-screen items-center justify-center p-6 text-center backdrop-blur-sm'
          : 'bg-navy flex min-h-screen items-center justify-center p-6 text-center'
      }
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="w-full max-w-xs">
        <div className="relative mx-auto flex size-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20">
          <span className="border-t-cyan border-r-cyan/30 absolute inset-[-8px] animate-spin rounded-[1.4rem] border-2 border-transparent" />
          <Image
            src="/ksp-emblem.png"
            alt=""
            width={42}
            height={50}
            priority
            className="h-auto w-[42px] object-contain"
          />
        </div>

        <p className="mt-6 text-sm font-bold tracking-[0.22em] text-white">KURUHU</p>
        <p className="mt-2 text-xs font-medium text-slate-400">{message}</p>

        <div className="mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <span className="animate-route-progress bg-cyan block h-full w-1/2 rounded-full" />
        </div>
      </div>
    </div>
  )
}
