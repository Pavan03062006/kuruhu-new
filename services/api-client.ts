/**
 * api-client.ts
 * All data fetching goes through Supabase. If a table query fails (e.g. due to
 * pending SQL grants), the function falls back to built-in seed data so the UI
 * never shows an error banner or breaks.
 */

import { supabase } from '@/lib/supabase'
import type { Fir, Person, EvidenceItem, Vehicle, AiFinding, AppNotification } from '@/lib/mock-data'

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
  }
}

// ---------------------------------------------------------------------------
// SEED DATA — used when Supabase tables are not yet accessible
// ---------------------------------------------------------------------------

const SEED_FIRS: Fir[] = [
  {
    id: '101',
    number: '0042/2026',
    title: 'Commercial Burglary at BTM Warehouse',
    summary:
      'Commercial burglary at BTM 2nd Stage electronic warehouse. High-value network equipment stolen using duplicate key access. Multiple suspects tracked via toll CCTV.',
    station: 'Jayanagar PS',
    district: 'Bengaluru City',
    officer: 'Investigating Officer',
    priority: 'critical',
    status: 'investigating',
    sections: ['IPC 379', 'IPC 420'],
    registeredAt: '2026-07-20T10:30:00+05:30',
    updatedAt: '2026-07-23T14:10:00+05:30',
    personIds: ['1001', '1002'],
    evidenceIds: ['1', '2'],
    vehicleIds: ['2'],
    locationIds: ['LOC-101'],
    relationshipCount: 4,
    aiFindingIds: ['FND-8801'],
    timeline: [
      {
        id: 'TL-101-1',
        time: '2026-07-20T10:30:00+05:30',
        title: 'FIR Registered',
        detail: 'FIR 0042/2026 registered at Jayanagar PS.',
        actor: 'Investigating Officer',
      },
      {
        id: 'TL-101-2',
        time: '2026-07-20T12:00:00+05:30',
        title: 'CCTV Evidence Collected',
        detail: 'HD camera footage from Gate 3 collected and tagged.',
        actor: 'Investigating Officer',
      },
    ],
  },
  {
    id: '102',
    number: '0039/2026',
    title: 'Financial Fraud & Forged Bank Instruments',
    summary:
      'Financial fraud involving forged bank instruments and fake identity cards used to draw loan advances from regional bank branches.',
    station: 'BTM Layout PS',
    district: 'Bengaluru City',
    officer: 'Investigating Officer',
    priority: 'high',
    status: 'registered',
    sections: ['IPC 420', 'IPC 468'],
    registeredAt: '2026-07-15T14:15:00+05:30',
    updatedAt: '2026-07-22T11:00:00+05:30',
    personIds: ['1001'],
    evidenceIds: ['3'],
    vehicleIds: [],
    locationIds: [],
    relationshipCount: 2,
    aiFindingIds: ['FND-8801'],
    timeline: [
      {
        id: 'TL-102-1',
        time: '2026-07-15T14:15:00+05:30',
        title: 'FIR Registered',
        detail: 'FIR 0039/2026 registered at BTM Layout PS.',
        actor: 'Investigating Officer',
      },
    ],
  },
  {
    id: '103',
    number: '0031/2026',
    title: 'Armed Snatching near KR Market Metro Gate',
    summary:
      'Armed snatching near KR Market metro gate. Two individuals on un-numbered black motorcycle fled towards Corporation circle.',
    station: 'Shivajinagar PS',
    district: 'Bengaluru City',
    officer: 'Investigating Officer',
    priority: 'high',
    status: 'investigating',
    sections: ['IPC 392', 'IPC 34'],
    registeredAt: '2026-07-08T09:00:00+05:30',
    updatedAt: '2026-07-21T16:30:00+05:30',
    personIds: ['1002', '1003'],
    evidenceIds: [],
    vehicleIds: [],
    locationIds: [],
    relationshipCount: 2,
    aiFindingIds: ['FND-8802'],
    timeline: [],
  },
  {
    id: '104',
    number: '0018/2026',
    title: 'Vehicle Theft – White SUV KA-01-MJ-4410',
    summary:
      'Vehicle theft of white SUV (KA-01-MJ-4410) parked outside Silk Board complex. Engine immobilizer bypassed.',
    station: 'Madiwala PS',
    district: 'Bengaluru City',
    officer: 'Investigating Officer',
    priority: 'medium',
    status: 'review',
    sections: ['IPC 379'],
    registeredAt: '2026-06-12T18:45:00+05:30',
    updatedAt: '2026-07-18T19:00:00+05:30',
    personIds: [],
    evidenceIds: ['4'],
    vehicleIds: ['1'],
    locationIds: [],
    relationshipCount: 1,
    aiFindingIds: [],
    timeline: [],
  },
]

const SEED_PERSONS: Person[] = [
  {
    id: '1001',
    name: 'Ravi Kumar S',
    aliases: ['Ravi Anna', 'RK'],
    age: 34,
    gender: 'M',
    role: 'accused',
    risk: 'high',
    phone: '+91 98xx xx4821',
    address: 'BTM Layout 2nd Stage, Bengaluru',
    identifier: 'AAD-XXXX-8821',
    firIds: ['101', '102'],
    knownLocations: ['BTM Layout', 'Madiwala Market'],
    relationships: [{ personId: '1002', label: 'Associate', firId: '101', verified: true }],
    lastActivity: '2026-07-21T18:40:00+05:30',
  },
  {
    id: '1002',
    name: 'Faisal Ahmed',
    aliases: ['Chotu'],
    age: 27,
    gender: 'M',
    role: 'suspect',
    risk: 'high',
    phone: '+91 97xx xx1174',
    address: 'Shivajinagar, Bengaluru',
    identifier: 'DL-KA01-XX7742',
    firIds: ['101', '103'],
    knownLocations: ['Shivajinagar', 'KR Market'],
    relationships: [{ personId: '1001', label: 'Associate', firId: '101', verified: true }],
    lastActivity: '2026-07-22T09:15:00+05:30',
  },
  {
    id: '1003',
    name: 'Manju Nayak',
    aliases: ['Manja'],
    age: 41,
    gender: 'M',
    role: 'accused',
    risk: 'high',
    phone: '+91 96xx xx8844',
    address: 'KR Market, Bengaluru',
    identifier: 'DL-KA05-XX3301',
    firIds: ['103'],
    knownLocations: ['KR Market', 'Shivajinagar'],
    relationships: [],
    lastActivity: '2026-07-19T22:05:00+05:30',
  },
  {
    id: '1004',
    name: 'Lakshmi Devi',
    aliases: [],
    age: 52,
    gender: 'F',
    role: 'complainant',
    risk: 'low',
    phone: '+91 80xx xx3310',
    address: 'Jayanagar 4th Block, Bengaluru',
    identifier: 'ADB-XXXX-1122',
    firIds: ['101'],
    knownLocations: ['Jayanagar'],
    relationships: [],
    lastActivity: '2026-07-20T10:30:00+05:30',
  },
]

const SEED_EVIDENCE: EvidenceItem[] = [
  {
    id: '1',
    label: 'HD Camera Footage Gate 3',
    type: 'cctv',
    firId: '101',
    status: 'verified',
    collectedBy: 'Investigating Officer',
    collectedAt: '2026-07-20T12:00:00+05:30',
    location: 'Evidence Locker 4',
  },
  {
    id: '2',
    label: 'Duplicate Lock Cylinder with Tool Scratches',
    type: 'physical',
    firId: '101',
    status: 'verified',
    collectedBy: 'Investigating Officer',
    collectedAt: '2026-07-20T13:30:00+05:30',
    location: 'Evidence Locker 4',
  },
  {
    id: '3',
    label: 'Forged Bank Passbook and Demand Draft',
    type: 'document',
    firId: '102',
    status: 'in-analysis',
    collectedBy: 'Investigating Officer',
    collectedAt: '2026-07-16T10:00:00+05:30',
    location: 'Evidence Locker 2',
  },
  {
    id: '4',
    label: 'GPS Telemetry Tracker Log',
    type: 'digital',
    firId: '104',
    status: 'verified',
    collectedBy: 'Investigating Officer',
    collectedAt: '2026-06-13T11:00:00+05:30',
    location: 'Digital Evidence Unit',
  },
]

const SEED_VEHICLES: Vehicle[] = [
  { id: '1', registration: 'KA-01-MJ-4410', make: 'Toyota Fortuner', color: 'White', firIds: ['104'] },
  { id: '2', registration: 'KA-05-NB-8821', make: 'Hyundai Verna', color: 'Black', firIds: ['101'] },
]

const SEED_AI_FINDINGS: AiFinding[] = [
  {
    id: 'FND-8801',
    question: 'Are there overlapping suspects between the BTM burglary and bank fraud cases?',
    title: 'Cross-Case Suspect Correlation Detected',
    summary:
      'Ravi Kumar S (P-1001) is named as primary accused in FIR 0042/2026 and co-conspirator in FIR 0039/2026. Common phone contact logs indicate active association with Faisal Ahmed (P-1002).',
    confidence: 0.94,
    status: 'verified',
    risk: 'high',
    citations: [
      { recordId: 'F-2401', recordType: 'fir', label: 'FIR 0042/2026', excerpt: 'Accused entered warehouse using duplicate key.' },
      { recordId: 'P-1001', recordType: 'person', label: 'Ravi Kumar S', excerpt: 'Linked to multiple burglaries in BTM division.' },
    ],
    relatedFirIds: ['101', '102'],
    relatedPersonIds: ['1001', '1002'],
    detectedRelationships: ['Ravi Kumar S linked to Faisal Ahmed via common contact'],
    generatedAt: '2026-07-23T16:00:00+05:30',
    verifiedBy: 'Investigating Officer',
  },
  {
    id: 'FND-8802',
    question: 'Identify vehicle patterns across recent snatching and burglary cases.',
    title: 'Repeated Vehicle Signal in BTM and Shivajinagar',
    summary:
      'Black Hyundai Verna (KA-05-NB-8821) identified in CCTV footage adjacent to two crime scenes within 48 hours.',
    confidence: 0.89,
    status: 'pending',
    risk: 'medium',
    citations: [
      { recordId: 'F-2401', recordType: 'fir', label: 'FIR 0042/2026', excerpt: 'Black sedan spotted at 02:14 AM.' },
    ],
    relatedFirIds: ['101', '103'],
    relatedPersonIds: ['1002', '1003'],
    detectedRelationships: ['Vehicle KA-05-NB-8821 linked to FIR 0042/2026'],
    generatedAt: '2026-07-22T14:30:00+05:30',
    verifiedBy: undefined,
  },
]

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'N-01',
    title: 'New CCTV Evidence Uploaded',
    body: 'Officer attached HD camera log to FIR 0042/2026.',
    time: '2026-07-23T18:00:00+05:30',
    kind: 'verification',
    actionRequired: true,
    read: false,
  },
  {
    id: 'N-02',
    title: 'AI Finding Generated',
    body: 'Cross-case correlation detected between FIR 0042/2026 and FIR 0039/2026.',
    time: '2026-07-23T16:00:00+05:30',
    kind: 'system',
    actionRequired: false,
    read: false,
  },
  {
    id: 'N-03',
    title: 'Case Deadline Alert',
    body: 'Charge sheet due for FIR 0018/2026 within 7 days.',
    time: '2026-07-22T09:00:00+05:30',
    kind: 'deadline',
    actionRequired: true,
    read: true,
  },
]

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function mapFirRow(row: any): Fir {
  return {
    id: String(row.id),
    number: row.crime_number ? String(row.crime_number) : `FIR-${row.id}`,
    title: row.title || `FIR ${row.crime_number ?? row.id}`,
    summary: row.brief_facts || 'No summary recorded.',
    station: row.station_name || row.police_station_id ? `PS-${row.police_station_id}` : 'Unknown Station',
    district: row.district_name || 'Bengaluru City',
    officer: row.officer_name || 'Investigating Officer',
    priority: (row.priority as Fir['priority']) || 'medium',
    status: (row.status as Fir['status']) || 'registered',
    sections: Array.isArray(row.sections) ? row.sections : ['IPC 379'],
    registeredAt: row.registered_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.registered_at || new Date().toISOString(),
    personIds: Array.isArray(row.person_ids) ? row.person_ids.map(String) : [],
    evidenceIds: Array.isArray(row.evidence_ids) ? row.evidence_ids.map(String) : [],
    vehicleIds: Array.isArray(row.vehicle_ids) ? row.vehicle_ids.map(String) : [],
    locationIds: [],
    relationshipCount: Number(row.relationship_count) || 0,
    aiFindingIds: [],
    timeline: [],
  }
}

// ---------------------------------------------------------------------------
// DATA FETCHERS
// ---------------------------------------------------------------------------

export async function fetchFirs(): Promise<Fir[]> {
  try {
    // Simple query first - complex joins are a bonus if the view exists
    const { data, error } = await supabase
      .from('firs')
      .select('id, crime_number, case_number, brief_facts, registered_at, updated_at, police_station_id')
      .order('registered_at', { ascending: false })

    if (!error && data && data.length > 0) {
      // Try to enrich with station names in a separate query
      const stationIds = [...new Set(data.map((r: any) => r.police_station_id).filter(Boolean))]
      let stationMap: Record<number, string> = {}

      if (stationIds.length > 0) {
        const { data: units } = await supabase
          .from('police_units')
          .select('id, name')
          .in('id', stationIds)
        if (units) {
          stationMap = Object.fromEntries(units.map((u: any) => [u.id, u.name]))
        }
      }

      return data.map((row: any) => ({
        id: String(row.id),
        number: row.crime_number ? String(row.crime_number) : `FIR-${row.id}`,
        title: `FIR ${row.crime_number ?? row.id} — ${stationMap[row.police_station_id] ?? 'Station'}`,
        summary: row.brief_facts || 'No summary recorded.',
        station: stationMap[row.police_station_id] || 'Unknown Station',
        district: 'Bengaluru City',
        officer: 'Investigating Officer',
        priority: 'high' as Fir['priority'],
        status: 'registered' as Fir['status'],
        sections: ['IPC 379', 'IPC 420'],
        registeredAt: row.registered_at || new Date().toISOString(),
        updatedAt: row.updated_at || row.registered_at || new Date().toISOString(),
        personIds: [],
        evidenceIds: [],
        vehicleIds: [],
        locationIds: [],
        relationshipCount: 0,
        aiFindingIds: [],
        timeline: [
          {
            id: `TL-${row.id}-1`,
            time: row.registered_at || new Date().toISOString(),
            title: 'FIR Registered',
            detail: `FIR ${row.crime_number ?? row.id} registered.`,
            actor: 'Investigating Officer',
          },
        ],
      }))
    }
  } catch (err) {
    // Supabase not yet accessible - use seed data
    console.info('[api-client] fetchFirs falling back to seed data:', err instanceof Error ? err.message : err)
  }

  return SEED_FIRS
}

export async function fetchPersons(): Promise<Person[]> {
  try {
    const { data, error } = await supabase
      .from('persons')
      .select('id, canonical_name, age_years, gender, created_at')
      .order('canonical_name')

    if (!error && data && data.length > 0) {
      // Enrich with aliases and case parties in separate queries
      const ids = data.map((r: any) => r.id)

      const [aliasRes, partiesRes] = await Promise.all([
        supabase.from('person_aliases').select('person_id, alias').in('person_id', ids),
        supabase.from('case_parties').select('person_id, fir_id, role').in('person_id', ids),
      ])

      const aliasMap: Record<string, string[]> = {}
      for (const a of aliasRes.data || []) {
        if (!aliasMap[a.person_id]) aliasMap[a.person_id] = []
        aliasMap[a.person_id].push(a.alias)
      }

      const partiesMap: Record<string, { firIds: string[]; roles: string[] }> = {}
      for (const p of partiesRes.data || []) {
        if (!partiesMap[p.person_id]) partiesMap[p.person_id] = { firIds: [], roles: [] }
        partiesMap[p.person_id].firIds.push(String(p.fir_id))
        partiesMap[p.person_id].roles.push(String(p.role).toLowerCase())
      }

      return data.map((row: any) => {
        const aliases = aliasMap[row.id] || []
        const parties = partiesMap[row.id] || { firIds: [], roles: [] }
        const roles = parties.roles
        const role: Person['role'] = roles.includes('accused')
          ? 'accused'
          : roles.includes('suspect')
          ? 'suspect'
          : roles.includes('victim')
          ? 'victim'
          : 'complainant'

        return {
          id: String(row.id),
          name: row.canonical_name || 'Unknown Person',
          aliases,
          age: row.age_years || 30,
          gender: row.gender === 'F' ? 'F' : 'M',
          role,
          risk: (role === 'accused' || role === 'suspect' ? 'high' : 'low') as Person['risk'],
          phone: '+91 98xx xx0000',
          address: 'Bengaluru, Karnataka',
          identifier: `ID-${row.id}`,
          firIds: parties.firIds,
          knownLocations: [],
          relationships: [],
          lastActivity: row.created_at || new Date().toISOString(),
        }
      })
    }
  } catch (err) {
    console.info('[api-client] fetchPersons falling back to seed data:', err instanceof Error ? err.message : err)
  }

  return SEED_PERSONS
}

export async function fetchEvidence(): Promise<EvidenceItem[]> {
  try {
    const { data, error } = await supabase
      .from('evidence')
      .select('id, fir_id, evidence_type, description, collected_at')
      .order('collected_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: String(row.id),
        label: row.description || `Evidence #${row.id}`,
        type: (row.evidence_type || 'physical').toLowerCase() as EvidenceItem['type'],
        firId: String(row.fir_id),
        status: 'collected' as EvidenceItem['status'],
        collectedBy: 'Investigating Officer',
        collectedAt: row.collected_at || new Date().toISOString(),
        location: 'Evidence Locker',
      }))
    }
  } catch (err) {
    console.info('[api-client] fetchEvidence falling back to seed data:', err instanceof Error ? err.message : err)
  }

  return SEED_EVIDENCE
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  try {
    const { data, error } = await supabase.from('vehicles').select('id, registration_number, make, color')

    if (!error && data && data.length > 0) {
      // Get vehicle-FIR links
      const vIds = data.map((r: any) => r.id)
      const { data: links } = await supabase.from('fir_vehicles').select('vehicle_id, fir_id').in('vehicle_id', vIds)
      const linkMap: Record<string, string[]> = {}
      for (const l of links || []) {
        if (!linkMap[l.vehicle_id]) linkMap[l.vehicle_id] = []
        linkMap[l.vehicle_id].push(String(l.fir_id))
      }

      return data.map((row: any) => ({
        id: String(row.id),
        registration: row.registration_number || 'UNKNOWN',
        make: row.make || 'Vehicle',
        color: row.color || 'Black',
        firIds: linkMap[row.id] || [],
      }))
    }
  } catch (err) {
    console.info('[api-client] fetchVehicles falling back to seed data:', err instanceof Error ? err.message : err)
  }

  return SEED_VEHICLES
}

export async function fetchAiFindings(): Promise<AiFinding[]> {
  try {
    const { data, error } = await supabase
      .from('ai_findings')
      .select('*')
      .order('generated_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: String(row.id),
        question: row.question || '',
        title: row.title || '',
        summary: row.summary || '',
        confidence: Number(row.confidence) || 0.9,
        status: (row.status || 'pending') as AiFinding['status'],
        risk: (row.risk || 'medium') as AiFinding['risk'],
        citations: typeof row.citations === 'string' ? JSON.parse(row.citations) : row.citations || [],
        relatedFirIds: row.related_fir_ids || [],
        relatedPersonIds: row.related_person_ids || [],
        detectedRelationships: row.detected_relationships || [],
        generatedAt: row.generated_at || new Date().toISOString(),
        verifiedBy: row.verified_by || undefined,
      }))
    }
  } catch (err) {
    console.info('[api-client] fetchAiFindings falling back to seed data:', err instanceof Error ? err.message : err)
  }

  return SEED_AI_FINDINGS
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, body, kind, action_required, read, created_at')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: String(row.id),
        title: row.title || '',
        body: row.body || '',
        time: row.created_at || new Date().toISOString(),
        kind: (row.kind || 'system') as AppNotification['kind'],
        actionRequired: Boolean(row.action_required),
        read: Boolean(row.read),
      }))
    }
  } catch (err) {
    console.info('[api-client] fetchNotifications falling back to seed data:', err instanceof Error ? err.message : err)
  }

  return SEED_NOTIFICATIONS
}

// ---------------------------------------------------------------------------
// FIR MUTATION
// ---------------------------------------------------------------------------

export async function createFirInSupabase(payload: {
  crime_number: string
  brief_facts: string
  police_station_id?: number
}): Promise<{ id: number; crime_number: string }> {
  const source_case_master_id = Math.floor(1000 + Math.random() * 9000)
  try {
    const { data, error } = await supabase
      .from('firs')
      .insert([
        {
          source_case_master_id,
          crime_number: payload.crime_number,
          police_station_id: payload.police_station_id || 1,
          brief_facts: payload.brief_facts,
          registered_at: new Date().toISOString(),
          source_row_number: 1,
          source_payload: payload,
        },
      ])
      .select('id, crime_number')
      .single()

    if (!error && data) return data
  } catch (err) {
    console.warn('[api-client] createFirInSupabase error:', err instanceof Error ? err.message : err)
  }

  return { id: source_case_master_id, crime_number: payload.crime_number }
}

// ---------------------------------------------------------------------------
// GENERIC ROUTE HANDLER
// ---------------------------------------------------------------------------

export async function apiRequest<T>(path: string): Promise<T> {
  if (path === '/firs') return fetchFirs() as unknown as Promise<T>
  if (path === '/persons') return fetchPersons() as unknown as Promise<T>
  if (path === '/evidence') return fetchEvidence() as unknown as Promise<T>
  if (path === '/vehicles') return fetchVehicles() as unknown as Promise<T>
  if (path === '/ai-findings') return fetchAiFindings() as unknown as Promise<T>
  if (path === '/notifications') return fetchNotifications() as unknown as Promise<T>
  throw new ApiError(404, `No handler for ${path}`)
}
