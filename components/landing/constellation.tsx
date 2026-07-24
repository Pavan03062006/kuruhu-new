/**
 * Animated evidence-graph constellation for the hero background.
 * Pure SVG + CSS animations (disabled automatically under prefers-reduced-motion).
 */

const NODES: { x: number; y: number; r: number; d: number }[] = [
  { x: 80, y: 90, r: 3, d: 0 }, { x: 210, y: 40, r: 4.5, d: 0.6 }, { x: 340, y: 120, r: 3.5, d: 1.2 },
  { x: 470, y: 55, r: 3, d: 0.3 }, { x: 620, y: 110, r: 5, d: 1.8 }, { x: 760, y: 50, r: 3, d: 0.9 },
  { x: 900, y: 130, r: 4, d: 1.5 }, { x: 1050, y: 70, r: 3.5, d: 0.2 }, { x: 1180, y: 140, r: 3, d: 2.1 },
  { x: 1320, y: 60, r: 4.5, d: 1.1 }, { x: 150, y: 230, r: 4, d: 1.7 }, { x: 420, y: 260, r: 3, d: 0.8 },
  { x: 700, y: 250, r: 4, d: 2.4 }, { x: 980, y: 270, r: 3.5, d: 0.5 }, { x: 1260, y: 240, r: 3, d: 1.4 },
]

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9],
  [1, 10], [2, 11], [4, 12], [6, 13], [8, 14], [10, 11], [11, 12], [12, 13], [13, 14], [4, 11], [6, 12],
]

export function Constellation({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const edgeStroke = tone === 'light' ? 'rgba(13,148,136,0.18)' : 'rgba(45,212,191,0.16)'
  const nodeAccent = tone === 'light' ? 'rgba(13,148,136,0.75)' : 'rgba(45,212,191,0.85)'
  const nodeBase = tone === 'light' ? 'rgba(100,116,139,0.4)' : 'rgba(148,163,184,0.5)'
  return (
    <svg viewBox="0 0 1400 320" className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
          stroke={edgeStroke} strokeWidth="1" strokeDasharray="6 6"
          className={i % 3 === 0 ? 'animate-edge-dash' : undefined}
        />
      ))}
      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.x} cy={n.y} r={n.r}
          fill={i % 4 === 0 ? nodeAccent : nodeBase}
          className="animate-node-pulse"
          style={{ animationDelay: `${n.d}s`, transformOrigin: `${n.x}px ${n.y}px` }}
        />
      ))}
    </svg>
  )
}
