/** Tiny single-series sparkline. Server-renderable, 2px stroke, end-point dot. */
export function Sparkline({ series, width = 84, height = 28, stroke = '#0d9488' }: { series: number[]; width?: number; height?: number; stroke?: string }) {
  const max = Math.max(...series, 1)
  const min = Math.min(...series, 0)
  const range = Math.max(max - min, 1)
  const pad = 3
  const pts = series.map((v, i) => {
    const x = pad + (i / (series.length - 1)) * (width - pad * 2)
    const y = pad + (1 - (v - min) / range) * (height - pad * 2)
    return [x, y] as const
  })
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [ex, ey] = pts[pts.length - 1]
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="shrink-0">
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle cx={ex} cy={ey} r="3" fill={stroke} stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  )
}
