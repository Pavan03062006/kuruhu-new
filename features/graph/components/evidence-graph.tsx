'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Car, CheckCircle2, CircleDashed, FileText, MapPin, Minus, Package, Plus, RotateCcw, User } from 'lucide-react'
import { PageHeader } from '@/components/kuruhu/page-header'
import { fetchFirs, fetchPersons, fetchEvidence, fetchVehicles } from '@/services/api-client'
import type { Fir, Person, EvidenceItem, Vehicle, EntityKind } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type GNode = { id: string; kind: EntityKind; label: string; sub: string; href?: string; x: number; y: number }
type GEdge = { source: string; target: string; label: string; firRef: string; verified: boolean }

const KIND_COLOR: Record<string, { fill: string; stroke: string; text: string }> = {
  fir: { fill: '#0b1220', stroke: '#2dd4bf', text: '#ffffff' },
  person: { fill: '#eef2ff', stroke: '#6366f1', text: '#3730a3' },
  vehicle: { fill: '#e0f2fe', stroke: '#0284c7', text: '#075985' },
  location: { fill: '#fef3c7', stroke: '#d97706', text: '#92400e' },
  evidence: { fill: '#ede9fe', stroke: '#7c3aed', text: '#5b21b6' },
}

const KIND_ICON = { fir: FileText, person: User, vehicle: Car, location: MapPin, evidence: Package, officer: User }
const KIND_RADIUS: Record<string, number> = { fir: 34, person: 26, vehicle: 22, location: 22, evidence: 18 }

function layout(nodes: GNode[], edges: GEdge[], w: number, h: number): GNode[] {
  const pos = nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2
    const r = n.kind === 'fir' ? 130 : 300
    return { ...n, x: w / 2 + r * Math.cos(angle * 3.7 + i), y: h / 2 + r * Math.sin(angle * 3.7 + i) }
  })
  const idx = new Map(pos.map((n, i) => [n.id, i]))
  for (let iter = 0; iter < 260; iter++) {
    const fx = new Array(pos.length).fill(0)
    const fy = new Array(pos.length).fill(0)
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        let dx = pos[i].x - pos[j].x
        let dy = pos[i].y - pos[j].y
        const d2 = Math.max(dx * dx + dy * dy, 100)
        const d = Math.sqrt(d2)
        const f = 30000 / d2
        dx /= d; dy /= d
        fx[i] += dx * f; fy[i] += dy * f
        fx[j] -= dx * f; fy[j] -= dy * f
      }
    }
    for (const e of edges) {
      const a = idx.get(e.source), b = idx.get(e.target)
      if (a === undefined || b === undefined) continue
      let dx = pos[b].x - pos[a].x
      let dy = pos[b].y - pos[a].y
      const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
      const f = (d - 195) * 0.015
      dx /= d; dy /= d
      fx[a] += dx * f * d * 0.02; fy[a] += dy * f * d * 0.02
      fx[b] -= dx * f * d * 0.02; fy[b] -= dy * f * d * 0.02
    }
    const cool = 1 - iter / 300
    for (let i = 0; i < pos.length; i++) {
      const cx = w / 2 - pos[i].x
      const cy = h / 2 - pos[i].y
      pos[i].x += (fx[i] + cx * 0.01) * cool * 0.25
      pos[i].y += (fy[i] + cy * 0.01) * cool * 0.25
    }
  }
  return pos
}

export function EvidenceGraph() {
  const [firs, setFirs] = useState<Fir[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [evidence, setEvidence] = useState<EvidenceItem[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedId, setSelectedId] = useState<string | null>('101')
  const [activeKinds, setActiveKinds] = useState<Record<EntityKind, boolean>>({
    fir: true, person: true, vehicle: true, location: true, evidence: true, officer: true,
  })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const draggingRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)

  useEffect(() => {
    Promise.all([
      fetchFirs().catch(() => []),
      fetchPersons().catch(() => []),
      fetchEvidence().catch(() => []),
      fetchVehicles().catch(() => []),
    ]).then(([fData, pData, eData, vData]) => {
      setFirs(fData)
      setPersons(pData)
      setEvidence(eData)
      setVehicles(vData)
    }).finally(() => setLoading(false))
  }, [])

  const { nodes, edges } = useMemo(() => {
    const rawNodes: GNode[] = []
    const rawEdges: GEdge[] = []

    firs.forEach(f => {
      rawNodes.push({ id: f.id, kind: 'fir', label: `FIR ${f.number}`, sub: f.station, href: `/workspace/firs/${f.id}/`, x: 0, y: 0 })
    })

    persons.forEach(p => {
      rawNodes.push({ id: p.id, kind: 'person', label: p.name, sub: p.role, href: `/workspace/persons/${p.id}/`, x: 0, y: 0 })
      p.firIds.forEach(fid => {
        rawEdges.push({ source: fid, target: p.id, label: p.role, firRef: fid, verified: true })
      })
    })

    evidence.forEach(e => {
      rawNodes.push({ id: e.id, kind: 'evidence', label: e.label, sub: e.type, x: 0, y: 0 })
      rawEdges.push({ source: e.firId, target: e.id, label: e.type, firRef: e.firId, verified: true })
    })

    vehicles.forEach(v => {
      rawNodes.push({ id: v.id, kind: 'vehicle', label: v.registration, sub: v.make, x: 0, y: 0 })
      v.firIds.forEach(fid => {
        rawEdges.push({ source: fid, target: v.id, label: 'Vehicle link', firRef: fid, verified: true })
      })
    })

    const visibleNodes = rawNodes.filter(n => activeKinds[n.kind])
    const visIds = new Set(visibleNodes.map(n => n.id))
    const visibleEdges = rawEdges.filter(e => visIds.has(e.source) && visIds.has(e.target))

    return { nodes: layout(visibleNodes, visibleEdges, 960, 640), edges: visibleEdges }
  }, [firs, persons, evidence, vehicles, activeKinds])

  const selectedNode = nodes.find(n => n.id === selectedId) || nodes[0]
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes])

  return (
    <>
      <PageHeader title="Evidence & Relationship Graph" description="Interactive link-analysis connecting FIRs, persons, evidence, vehicles, and locations across Supabase database." />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['fir', 'person', 'vehicle', 'evidence'] as EntityKind[]).map(k => (
            <button
              key={k}
              onClick={() => setActiveKinds(s => ({ ...s, [k]: !s[k] }))}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all',
                activeKinds[k] ? 'bg-navy text-white shadow-sm' : 'bg-canvas text-ink-muted ring-1 ring-inset ring-line hover:text-ink',
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(z => Math.max(0.6, z - 0.15))} className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-white hover:bg-canvas"><Minus className="size-4" /></button>
          <span className="w-12 text-center font-mono text-xs font-bold">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.8, z + 0.15))} className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-white hover:bg-canvas"><Plus className="size-4" /></button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-white hover:bg-canvas ml-2"><RotateCcw className="size-3.5" /></button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        {/* Canvas */}
        <div className="relative overflow-hidden rounded-xl border border-line bg-navy/95 lg:col-span-3 min-h-[580px]">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-cyan">Loading live network from Supabase DB...</div>
          ) : (
            <svg
              className="h-[580px] w-full cursor-grab active:cursor-grabbing"
              viewBox="0 0 960 640"
              onMouseDown={e => { draggingRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y } }}
              onMouseMove={e => {
                if (!draggingRef.current) return
                setPan({ x: draggingRef.current.panX + (e.clientX - draggingRef.current.startX), y: draggingRef.current.panY + (e.clientY - draggingRef.current.startY) })
              }}
              onMouseUp={() => { draggingRef.current = null }}
            >
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {edges.map((e, idx) => {
                  const s = nodeMap.get(e.source), t = nodeMap.get(e.target)
                  if (!s || !t) return null
                  const isSel = selectedId === s.id || selectedId === t.id
                  return (
                    <g key={idx}>
                      <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={isSel ? '#2dd4bf' : '#334155'} strokeWidth={isSel ? 2.5 : 1.2} />
                      <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2 - 4} fill="#94a3b8" fontSize="10" textAnchor="middle">{e.label}</text>
                    </g>
                  )
                })}
                {nodes.map(n => {
                  const isSel = selectedId === n.id
                  const col = KIND_COLOR[n.kind] || KIND_COLOR.fir
                  const r = KIND_RADIUS[n.kind] || 22
                  return (
                    <g key={n.id} transform={`translate(${n.x}, ${n.y})`} onClick={() => setSelectedId(n.id)} className="cursor-pointer">
                      <circle r={r} fill={col.fill} stroke={isSel ? '#2dd4bf' : col.stroke} strokeWidth={isSel ? 3.5 : 2} />
                      <text fill={col.text} fontSize="11" fontWeight="bold" textAnchor="middle" dy="4">{n.label.slice(0, 10)}</text>
                    </g>
                  )
                })}
              </g>
            </svg>
          )}
        </div>

        {/* Sidebar Info */}
        <aside className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          {selectedNode ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-navy px-2 py-0.5 text-xs font-bold text-cyan capitalize">{selectedNode.kind}</span>
                <span className="font-mono text-xs font-semibold text-ink-muted">{selectedNode.id}</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-ink">{selectedNode.label}</h3>
              <p className="mt-1 text-xs text-ink-muted">{selectedNode.sub}</p>
              {selectedNode.href && (
                <Link href={selectedNode.href} className="mt-4 inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-700">
                  Open profile <ArrowUpRight className="size-3.5" />
                </Link>
              )}
            </div>
          ) : (
            <p className="text-xs text-ink-muted">Click any graph node to inspect live entity connections.</p>
          )}
        </aside>
      </div>
    </>
  )
}
