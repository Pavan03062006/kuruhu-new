export function PageSkeleton() {
  return (
    <div aria-label="Loading" className="animate-pulse space-y-4">
      <div className="h-8 w-64 rounded-lg bg-slate-200" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-line bg-white" />
        ))}
      </div>
      <div className="h-72 rounded-xl border border-line bg-white" />
    </div>
  )
}
