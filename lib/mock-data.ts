/**
 * KURUHU demo intelligence dataset.
 * Deterministic mock data used by every workspace screen until the
 * FastAPI domain services are wired in. All records are fictional.
 */

export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type FirStatus = 'draft' | 'registered' | 'investigating' | 'review' | 'closed'
export type PersonRole = 'accused' | 'suspect' | 'complainant' | 'witness' | 'victim'
export type VerificationStatus = 'verified' | 'pending' | 'rejected'
export type EntityKind = 'fir' | 'person' | 'location' | 'vehicle' | 'evidence' | 'officer'

export type TimelineEvent = { id: string; time: string; title: string; detail: string; actor: string }

export type Fir = {
  id: string
  number: string
  title: string
  summary: string
  station: string
  district: string
  officer: string
  priority: Priority
  status: FirStatus
  sections: string[]
  registeredAt: string
  updatedAt: string
  personIds: string[]
  evidenceIds: string[]
  vehicleIds: string[]
  locationIds: string[]
  relationshipCount: number
  aiFindingIds: string[]
  timeline: TimelineEvent[]
}

export type Person = {
  id: string
  name: string
  aliases: string[]
  age: number
  gender: 'M' | 'F'
  role: PersonRole
  risk: 'high' | 'medium' | 'low'
  phone: string
  address: string
  identifier: string
  firIds: string[]
  socioDemographics?: {
    occupation: string
    educationLevel: string
    incomeBracket: string
    originDistrict: string
    familyLinksCount: number
    economicRiskFactor: 'High' | 'Medium' | 'Low'
  }
  behavioralProfile?: {
    modusOperandiSignature: string
    recidivismScore: number // 0 - 100
    violencePropensity: 'High' | 'Medium' | 'Low'
    communicationFingerprint: string
    accompliceRiskIndex: number // 0 - 100
  }
  knownLocations: string[]
  relationships: { personId: string; label: string; firId: string; verified: boolean }[]
  lastActivity: string
}

export type EvidenceItem = {
  id: string
  label: string
  type: 'physical' | 'digital' | 'document' | 'biological' | 'cctv'
  firId: string
  status: 'collected' | 'in-analysis' | 'verified' | 'archived'
  collectedBy: string
  collectedAt: string
  location: string
}

export type Vehicle = { id: string; registration: string; make: string; color: string; firIds: string[] }
export type LocationRec = { id: string; name: string; area: string; district: string; firIds: string[] }

export type Citation = { recordId: string; recordType: 'fir' | 'evidence' | 'statement' | 'person'; label: string; excerpt: string }

export type AiFinding = {
  id: string
  question: string
  title: string
  summary: string
  confidence: number
  status: VerificationStatus
  risk: 'high' | 'medium' | 'low'
  citations: Citation[]
  relatedFirIds: string[]
  relatedPersonIds: string[]
  detectedRelationships: string[]
  generatedAt: string
  verifiedBy?: string
}

export type ActivityEvent = {
  id: string
  time: string
  actor: string
  role: string
  action: string
  target: string
  targetType: EntityKind | 'ai-finding' | 'system'
  detail: string
}

export type AppNotification = {
  id: string
  title: string
  body: string
  time: string
  kind: 'assignment' | 'verification' | 'deadline' | 'system' | 'escalation'
  actionRequired: boolean
  read: boolean
}

/* ------------------------------------------------------------------ */

export const CURRENT_OFFICER = {
  name: 'Insp. Meera Kulkarni',
  rank: 'Inspector',
  badge: 'KSP-30412',
  station: 'Jayanagar PS',
  district: 'Bengaluru City',
  role: 'Investigating Officer',
}

export const PERSONS: Person[] = [
  {
    id: 'P-1001', name: 'Ravi Kumar S', aliases: ['Ravi Anna', 'RK'], age: 34, gender: 'M', role: 'accused', risk: 'high',
    phone: '+91 98xx xx4821', address: 'BTM Layout 2nd Stage, Bengaluru', identifier: 'AAD-XXXX-8821',
    firIds: ['F-2401', 'F-2388', 'F-2296'], knownLocations: ['BTM Layout', 'Madiwala Market', 'Hosur Road'],
    socioDemographics: {
      occupation: 'Unemployed (Former Auto Driver)',
      educationLevel: 'Secondary School (SSLC)',
      incomeBracket: 'Low Income (< ₹1.5L/year)',
      originDistrict: 'Mandya',
      familyLinksCount: 3,
      economicRiskFactor: 'High',
    },
    behavioralProfile: {
      modusOperandiSignature: 'Night Burglary & Two-Wheeler Theft using Master Keys; targets unmanned residential parking 02:00-04:00 AM.',
      recidivismScore: 84,
      violencePropensity: 'Medium',
      communicationFingerprint: 'Frequent burner SIM switching after crimes; 14 contacts identified in network graph.',
      accompliceRiskIndex: 91,
    },
    relationships: [
      { personId: 'P-1002', label: 'Associate — co-accused', firId: 'F-2401', verified: true },
      { personId: 'P-1004', label: 'Shares phone contact', firId: 'F-2388', verified: false },
    ],
    lastActivity: '2026-07-21T18:40:00+05:30',
  },
  {
    id: 'P-1002', name: 'Faisal Ahmed', aliases: ['Chotu'], age: 27, gender: 'M', role: 'suspect', risk: 'high',
    phone: '+91 97xx xx1174', address: 'Shivajinagar, Bengaluru', identifier: 'DL-KA01-XX7742',
    firIds: ['F-2401', 'F-2367'], knownLocations: ['Shivajinagar', 'KR Market'],
    socioDemographics: {
      occupation: 'Scrap Dealer Assistant',
      educationLevel: 'Higher Secondary (PUC)',
      incomeBracket: 'Low Income (< ₹2L/year)',
      originDistrict: 'Bengaluru Urban',
      familyLinksCount: 4,
      economicRiskFactor: 'High',
    },
    behavioralProfile: {
      modusOperandiSignature: 'Fencing stolen vehicle parts & altered chassis numbers; rapid liquidation within 48 hours.',
      recidivismScore: 76,
      violencePropensity: 'Low',
      communicationFingerprint: 'Encrypted message groups & UPI micro-transactions to accomplices.',
      accompliceRiskIndex: 82,
    },
    relationships: [
      { personId: 'P-1001', label: 'Associate — co-accused', firId: 'F-2401', verified: true },
      { personId: 'P-1003', label: 'Seen together (CCTV)', firId: 'F-2367', verified: true },
    ],
    lastActivity: '2026-07-22T09:15:00+05:30',
  },
  {
    id: 'P-1003', name: 'Manju Nayak', aliases: ['Manja'], age: 41, gender: 'M', role: 'suspect', risk: 'medium',
    phone: '+91 96xx xx9080', address: 'Yeshwanthpur, Bengaluru', identifier: 'AAD-XXXX-1290',
    firIds: ['F-2367', 'F-2296'], knownLocations: ['Yeshwanthpur', 'Peenya Industrial Area'],
    relationships: [{ personId: 'P-1002', label: 'Seen together (CCTV)', firId: 'F-2367', verified: true }],
    lastActivity: '2026-07-19T22:05:00+05:30',
  },
  {
    id: 'P-1004', name: 'Lakshmi Devi', aliases: [], age: 52, gender: 'F', role: 'complainant', risk: 'low',
    phone: '+91 99xx xx3356', address: 'Jayanagar 4th Block, Bengaluru', identifier: 'AAD-XXXX-5567',
    firIds: ['F-2401'], knownLocations: ['Jayanagar'],
    relationships: [{ personId: 'P-1001', label: 'Reported against', firId: 'F-2401', verified: true }],
    lastActivity: '2026-07-18T11:30:00+05:30',
  },
  {
    id: 'P-1005', name: 'Arjun Shetty', aliases: ['AJ'], age: 29, gender: 'M', role: 'witness', risk: 'low',
    phone: '+91 98xx xx7714', address: 'Koramangala 5th Block, Bengaluru', identifier: 'PAN-XXXXX331K',
    firIds: ['F-2388'], knownLocations: ['Koramangala'],
    relationships: [], lastActivity: '2026-07-20T16:00:00+05:30',
  },
  {
    id: 'P-1006', name: 'Sunitha Rao', aliases: [], age: 36, gender: 'F', role: 'victim', risk: 'low',
    phone: '+91 95xx xx2210', address: 'Malleshwaram, Bengaluru', identifier: 'AAD-XXXX-9034',
    firIds: ['F-2367'], knownLocations: ['Malleshwaram'],
    relationships: [], lastActivity: '2026-07-17T14:20:00+05:30',
  },
  {
    id: 'P-1007', name: 'Imran Pasha', aliases: ['Bhai'], age: 45, gender: 'M', role: 'accused', risk: 'high',
    phone: '+91 90xx xx6645', address: 'Frazer Town, Bengaluru', identifier: 'DL-KA03-XX2210',
    firIds: ['F-2296', 'F-2244'], knownLocations: ['Frazer Town', 'Shivajinagar', 'Hosur Road'],
    relationships: [{ personId: 'P-1001', label: 'Financial link (transfers)', firId: 'F-2296', verified: false }],
    lastActivity: '2026-07-22T20:45:00+05:30',
  },
  {
    id: 'P-1008', name: 'Deepa Hegde', aliases: [], age: 31, gender: 'F', role: 'complainant', risk: 'low',
    phone: '+91 91xx xx8890', address: 'Indiranagar, Bengaluru', identifier: 'AAD-XXXX-4412',
    firIds: ['F-2388'], knownLocations: ['Indiranagar'],
    relationships: [], lastActivity: '2026-07-21T10:05:00+05:30',
  },
]

export const VEHICLES: Vehicle[] = [
  { id: 'V-501', registration: 'KA-01-MJ-4482', make: 'Bajaj Pulsar 150', color: 'Black', firIds: ['F-2401', 'F-2388'] },
  { id: 'V-502', registration: 'KA-05-HT-9921', make: 'Maruti Swift', color: 'White', firIds: ['F-2367'] },
  { id: 'V-503', registration: 'KA-03-EQ-1104', make: 'Tata Ace', color: 'Yellow', firIds: ['F-2296'] },
]

export const LOCATIONS: LocationRec[] = [
  { id: 'L-301', name: 'Jayanagar 4th Block Market', area: 'Jayanagar', district: 'Bengaluru City', firIds: ['F-2401'] },
  { id: 'L-302', name: 'Madiwala Market Junction', area: 'Madiwala', district: 'Bengaluru City', firIds: ['F-2401', 'F-2388'] },
  { id: 'L-303', name: 'KR Market West Gate', area: 'KR Market', district: 'Bengaluru City', firIds: ['F-2367'] },
  { id: 'L-304', name: 'Peenya Industrial Area Ph-2', area: 'Peenya', district: 'Bengaluru City', firIds: ['F-2296'] },
  { id: 'L-305', name: 'Hosur Road Toll Plaza', area: 'Electronic City', district: 'Bengaluru City', firIds: ['F-2296', 'F-2244'] },
]

export const EVIDENCE: EvidenceItem[] = [
  { id: 'E-701', label: 'CCTV footage — market entrance (18:22–18:41)', type: 'cctv', firId: 'F-2401', status: 'verified', collectedBy: 'HC Prakash N', collectedAt: '2026-07-15T20:10:00+05:30', location: 'Jayanagar 4th Block Market' },
  { id: 'E-702', label: 'Recovered mobile phone (Redmi 12, IMEI ...8842)', type: 'physical', firId: 'F-2401', status: 'in-analysis', collectedBy: 'PSI Divya R', collectedAt: '2026-07-16T11:35:00+05:30', location: 'BTM Layout residence' },
  { id: 'E-703', label: 'Call detail records — +91 98xx xx4821 (30 days)', type: 'digital', firId: 'F-2401', status: 'verified', collectedBy: 'Cyber Cell', collectedAt: '2026-07-17T09:00:00+05:30', location: 'CDR request #4471' },
  { id: 'E-704', label: 'Complainant statement — Lakshmi Devi', type: 'document', firId: 'F-2401', status: 'verified', collectedBy: 'Insp. Meera Kulkarni', collectedAt: '2026-07-15T19:05:00+05:30', location: 'Jayanagar PS' },
  { id: 'E-705', label: 'Fingerprint lift — window grille', type: 'biological', firId: 'F-2388', status: 'in-analysis', collectedBy: 'FSL Team B', collectedAt: '2026-07-18T08:40:00+05:30', location: 'Indiranagar residence' },
  { id: 'E-706', label: 'CCTV footage — KR Market gate (02:10–02:26)', type: 'cctv', firId: 'F-2367', status: 'verified', collectedBy: 'HC Prakash N', collectedAt: '2026-07-12T10:20:00+05:30', location: 'KR Market West Gate' },
  { id: 'E-707', label: 'UPI transaction trail — 14 transfers', type: 'digital', firId: 'F-2296', status: 'in-analysis', collectedBy: 'Cyber Cell', collectedAt: '2026-07-19T15:30:00+05:30', location: 'Bank RTGS ref #99120' },
  { id: 'E-708', label: 'Seized ledger book (42 pages)', type: 'document', firId: 'F-2296', status: 'collected', collectedBy: 'PSI Divya R', collectedAt: '2026-07-20T17:55:00+05:30', location: 'Peenya godown' },
]

export const FIRS: Fir[] = [
  {
    id: 'F-2401', number: '0245/2026', title: 'Chain snatching and assault — Jayanagar market',
    summary: 'Complainant reports gold chain snatching by two persons on a black motorcycle near Jayanagar 4th Block Market. Minor injuries sustained. CCTV coverage available; two suspects identified through footage and CDR analysis.',
    station: 'Jayanagar PS', district: 'Bengaluru City', officer: 'Insp. Meera Kulkarni', priority: 'high', status: 'investigating',
    sections: ['BNS 304(2)', 'BNS 115(2)', 'BNS 351(3)'], registeredAt: '2026-07-15T19:20:00+05:30', updatedAt: '2026-07-22T18:10:00+05:30',
    personIds: ['P-1001', 'P-1002', 'P-1004'], evidenceIds: ['E-701', 'E-702', 'E-703', 'E-704'], vehicleIds: ['V-501'], locationIds: ['L-301', 'L-302'],
    relationshipCount: 6, aiFindingIds: ['AI-01', 'AI-03'],
    timeline: [
      { id: 't1', time: '2026-07-15T18:25:00+05:30', title: 'Incident occurred', detail: 'Chain snatching reported at Jayanagar 4th Block Market', actor: 'System' },
      { id: 't2', time: '2026-07-15T19:20:00+05:30', title: 'FIR registered', detail: 'FIR 0245/2026 registered at Jayanagar PS', actor: 'Insp. Meera Kulkarni' },
      { id: 't3', time: '2026-07-15T20:10:00+05:30', title: 'CCTV secured', detail: 'Market entrance footage collected and hashed', actor: 'HC Prakash N' },
      { id: 't4', time: '2026-07-17T09:00:00+05:30', title: 'CDR received', detail: '30-day call detail records received from provider', actor: 'Cyber Cell' },
      { id: 't5', time: '2026-07-21T14:45:00+05:30', title: 'Suspect identified', detail: 'Ravi Kumar S identified via CCTV + CDR correlation', actor: 'AI Investigator (verified)' },
    ],
  },
  {
    id: 'F-2388', number: '0232/2026', title: 'House burglary — Indiranagar residence',
    summary: 'Night-time break-in through rear window; jewellery and cash stolen. Fingerprint lifts under FSL analysis. Motorcycle matching V-501 seen on street CCTV at 01:40.',
    station: 'Indiranagar PS', district: 'Bengaluru City', officer: 'PSI Divya R', priority: 'medium', status: 'investigating',
    sections: ['BNS 331(4)', 'BNS 305'], registeredAt: '2026-07-18T07:55:00+05:30', updatedAt: '2026-07-21T12:30:00+05:30',
    personIds: ['P-1001', 'P-1005', 'P-1008'], evidenceIds: ['E-705'], vehicleIds: ['V-501'], locationIds: ['L-302'],
    relationshipCount: 4, aiFindingIds: ['AI-02'],
    timeline: [
      { id: 't1', time: '2026-07-18T02:00:00+05:30', title: 'Estimated incident window', detail: 'Break-in between 01:30 and 02:30 per neighbour statement', actor: 'System' },
      { id: 't2', time: '2026-07-18T07:55:00+05:30', title: 'FIR registered', detail: 'FIR 0232/2026 registered at Indiranagar PS', actor: 'PSI Divya R' },
      { id: 't3', time: '2026-07-18T08:40:00+05:30', title: 'Scene processed', detail: 'FSL lifted prints from window grille', actor: 'FSL Team B' },
    ],
  },
  {
    id: 'F-2367', number: '0219/2026', title: 'Vehicle theft ring — KR Market',
    summary: 'White Swift stolen from KR Market parking; third similar theft in the area in six weeks. CCTV shows two known suspects. Pattern analysis suggests organised activity.',
    station: 'Halasuru Gate PS', district: 'Bengaluru City', officer: 'Insp. Ramesh Gowda', priority: 'high', status: 'review',
    sections: ['BNS 303(2)', 'BNS 317(2)'], registeredAt: '2026-07-12T09:10:00+05:30', updatedAt: '2026-07-20T16:40:00+05:30',
    personIds: ['P-1002', 'P-1003', 'P-1006'], evidenceIds: ['E-706'], vehicleIds: ['V-502'], locationIds: ['L-303'],
    relationshipCount: 5, aiFindingIds: ['AI-04'],
    timeline: [
      { id: 't1', time: '2026-07-12T02:15:00+05:30', title: 'Vehicle stolen', detail: 'Swift KA-05-HT-9921 taken from west gate parking', actor: 'System' },
      { id: 't2', time: '2026-07-12T09:10:00+05:30', title: 'FIR registered', detail: 'FIR 0219/2026 registered at Halasuru Gate PS', actor: 'Insp. Ramesh Gowda' },
      { id: 't3', time: '2026-07-20T16:40:00+05:30', title: 'Sent for review', detail: 'Case file forwarded to ACP for charge review', actor: 'Insp. Ramesh Gowda' },
    ],
  },
  {
    id: 'F-2296', number: '0148/2026', title: 'Illegal money lending and extortion — Peenya',
    summary: 'Extortion complaint against organised lending racket operating from a Peenya godown. UPI trail links collections across three FIRs. Ledger seized; financial analysis in progress.',
    station: 'Peenya PS', district: 'Bengaluru City', officer: 'Insp. Meera Kulkarni', priority: 'critical', status: 'investigating',
    sections: ['BNS 308(5)', 'BNS 351(2)', 'KMPL Act 9'], registeredAt: '2026-06-28T13:00:00+05:30', updatedAt: '2026-07-22T20:50:00+05:30',
    personIds: ['P-1001', 'P-1003', 'P-1007'], evidenceIds: ['E-707', 'E-708'], vehicleIds: ['V-503'], locationIds: ['L-304', 'L-305'],
    relationshipCount: 9, aiFindingIds: ['AI-01', 'AI-05'],
    timeline: [
      { id: 't1', time: '2026-06-28T13:00:00+05:30', title: 'FIR registered', detail: 'FIR 0148/2026 registered at Peenya PS', actor: 'Insp. Meera Kulkarni' },
      { id: 't2', time: '2026-07-19T15:30:00+05:30', title: 'UPI trail received', detail: '14 transfers mapped between accused accounts', actor: 'Cyber Cell' },
      { id: 't3', time: '2026-07-20T17:55:00+05:30', title: 'Godown searched', detail: 'Ledger book seized under panchnama', actor: 'PSI Divya R' },
    ],
  },
  {
    id: 'F-2244', number: '0096/2026', title: 'Highway cargo pilferage — Hosur Road',
    summary: 'Repeated pilferage from parked cargo trucks near the toll plaza. One accused identified; case closed after charge sheet.',
    station: 'Electronic City PS', district: 'Bengaluru City', officer: 'PSI Anand T', priority: 'low', status: 'closed',
    sections: ['BNS 303(2)'], registeredAt: '2026-05-30T10:20:00+05:30', updatedAt: '2026-07-08T11:00:00+05:30',
    personIds: ['P-1007'], evidenceIds: [], vehicleIds: [], locationIds: ['L-305'],
    relationshipCount: 2, aiFindingIds: [],
    timeline: [
      { id: 't1', time: '2026-05-30T10:20:00+05:30', title: 'FIR registered', detail: 'FIR 0096/2026 registered at Electronic City PS', actor: 'PSI Anand T' },
      { id: 't2', time: '2026-07-08T11:00:00+05:30', title: 'Case closed', detail: 'Charge sheet filed; case closed', actor: 'PSI Anand T' },
    ],
  },
  {
    id: 'F-2410', number: '0251/2026', title: 'Mobile phone snatching — Majestic bus stand',
    summary: 'Phone snatched at platform 12 during evening rush. Complaint registered; awaiting CCTV pull from BMTC control room.',
    station: 'Upparpet PS', district: 'Bengaluru City', officer: 'Insp. Ramesh Gowda', priority: 'medium', status: 'registered',
    sections: ['BNS 304(2)'], registeredAt: '2026-07-22T19:35:00+05:30', updatedAt: '2026-07-22T19:35:00+05:30',
    personIds: [], evidenceIds: [], vehicleIds: [], locationIds: [],
    relationshipCount: 0, aiFindingIds: [],
    timeline: [
      { id: 't1', time: '2026-07-22T19:35:00+05:30', title: 'FIR registered', detail: 'FIR 0251/2026 registered at Upparpet PS', actor: 'Insp. Ramesh Gowda' },
    ],
  },
]

export const AI_FINDINGS: AiFinding[] = [
  {
    id: 'AI-01', question: 'Are the Jayanagar snatching and Peenya extortion cases connected?',
    title: 'Financial link between F-2401 accused and Peenya lending racket',
    summary: 'Ravi Kumar S (accused, FIR 0245/2026) received 4 UPI transfers totalling ₹48,500 from an account controlled by Imran Pasha (accused, FIR 0148/2026) within 10 days of the snatching incident. Timing and amounts are consistent with proceeds handling.',
    confidence: 0.82, status: 'pending', risk: 'high',
    citations: [
      { recordId: 'E-707', recordType: 'evidence', label: 'UPI transaction trail — FIR 0148/2026', excerpt: 'Transfers #6, #9, #11, #14 → account ...8821 (Ravi Kumar S)' },
      { recordId: 'E-703', recordType: 'evidence', label: 'CDR — +91 98xx xx4821', excerpt: '11 calls to +91 90xx xx6645 (Imran Pasha) between 15–19 Jul' },
      { recordId: 'F-2296', recordType: 'fir', label: 'FIR 0148/2026 — ledger entries', excerpt: 'Ledger p.31: "R.K. — 48,500 adjusted"' },
    ],
    relatedFirIds: ['F-2401', 'F-2296'], relatedPersonIds: ['P-1001', 'P-1007'],
    detectedRelationships: ['Ravi Kumar S ↔ Imran Pasha (financial)', 'F-2401 ↔ F-2296 (proceeds trail)'],
    generatedAt: '2026-07-22T21:05:00+05:30',
  },
  {
    id: 'AI-02', question: 'Does vehicle V-501 appear in other open cases?',
    title: 'Motorcycle KA-01-MJ-4482 linked to Indiranagar burglary window',
    summary: 'The motorcycle registered to the F-2401 accused appears on street CCTV 400 m from the Indiranagar burglary scene at 01:40, inside the estimated incident window (01:30–02:30).',
    confidence: 0.74, status: 'verified', risk: 'medium',
    citations: [
      { recordId: 'F-2388', recordType: 'fir', label: 'FIR 0232/2026 — CCTV canvass note', excerpt: 'Black Pulsar, partial plate KA-01-MJ-44xx at 01:40' },
      { recordId: 'E-701', recordType: 'evidence', label: 'CCTV — Jayanagar market', excerpt: 'Same vehicle, full plate visible at 18:24' },
    ],
    relatedFirIds: ['F-2388', 'F-2401'], relatedPersonIds: ['P-1001'],
    detectedRelationships: ['V-501 ↔ F-2388 (scene proximity)'],
    generatedAt: '2026-07-21T10:15:00+05:30', verifiedBy: 'PSI Divya R',
  },
  {
    id: 'AI-03', question: 'Identify the second rider in the Jayanagar CCTV footage.',
    title: 'Pillion rider consistent with Faisal Ahmed',
    summary: 'Gait and build analysis of the pillion rider is consistent with Faisal Ahmed, who co-occurs with Ravi Kumar S in prior case records. Facial identification is not possible from available footage.',
    confidence: 0.61, status: 'pending', risk: 'medium',
    citations: [
      { recordId: 'E-701', recordType: 'evidence', label: 'CCTV — market entrance', excerpt: 'Pillion rider, 18:22:41–18:23:05' },
      { recordId: 'P-1002', recordType: 'person', label: 'Person record — Faisal Ahmed', excerpt: 'Known associate of Ravi Kumar S (FIR 0219/2026)' },
    ],
    relatedFirIds: ['F-2401'], relatedPersonIds: ['P-1002', 'P-1001'],
    detectedRelationships: ['Faisal Ahmed ↔ F-2401 (probable presence)'],
    generatedAt: '2026-07-21T14:40:00+05:30',
  },
  {
    id: 'AI-04', question: 'Is the KR Market vehicle theft part of a pattern?',
    title: 'Three-theft pattern around KR Market with common suspects',
    summary: 'Three vehicle thefts within 1.2 km of KR Market in six weeks share time-of-night (01:45–02:30), entry method, and two recurring individuals on CCTV. Pattern is consistent with an organised ring.',
    confidence: 0.88, status: 'verified', risk: 'high',
    citations: [
      { recordId: 'E-706', recordType: 'evidence', label: 'CCTV — KR Market west gate', excerpt: 'Two persons, 02:10–02:26, matched across incidents' },
      { recordId: 'F-2367', recordType: 'fir', label: 'FIR 0219/2026 — MO note', excerpt: 'Door-lock bypass identical to FIR 0187 and 0203' },
    ],
    relatedFirIds: ['F-2367'], relatedPersonIds: ['P-1002', 'P-1003'],
    detectedRelationships: ['F-2367 ↔ prior thefts (MO match)'],
    generatedAt: '2026-07-19T11:50:00+05:30', verifiedBy: 'Insp. Ramesh Gowda',
  },
  {
    id: 'AI-05', question: 'Map the collection network in the Peenya lending case.',
    title: 'Hub-and-spoke collection network centred on Imran Pasha',
    summary: 'UPI trail and ledger entries indicate a hub-and-spoke structure: two collectors route payments from at least 17 borrowers to accounts controlled by Imran Pasha, with weekly settlement on Mondays.',
    confidence: 0.79, status: 'rejected', risk: 'high',
    citations: [
      { recordId: 'E-707', recordType: 'evidence', label: 'UPI transaction trail', excerpt: 'Weekly aggregation pattern, Mondays 10:00–12:00' },
      { recordId: 'E-708', recordType: 'evidence', label: 'Seized ledger', excerpt: 'Collector initials "M.N." and "R.K." across 17 borrower rows' },
    ],
    relatedFirIds: ['F-2296'], relatedPersonIds: ['P-1007', 'P-1003', 'P-1001'],
    detectedRelationships: ['Imran Pasha ↔ 2 collectors ↔ 17 borrowers'],
    generatedAt: '2026-07-20T18:30:00+05:30', verifiedBy: 'Insp. Meera Kulkarni',
  },
]

export const ACTIVITY: ActivityEvent[] = [
  { id: 'A-01', time: '2026-07-22T21:05:00+05:30', actor: 'AI Investigator', role: 'System', action: 'Generated finding', target: 'AI-01 — Financial link F-2401 ↔ F-2296', targetType: 'ai-finding', detail: 'Confidence 82%. Queued for human verification.' },
  { id: 'A-02', time: '2026-07-22T20:50:00+05:30', actor: 'Insp. Meera Kulkarni', role: 'Investigating Officer', action: 'Updated FIR', target: 'FIR 0148/2026', targetType: 'fir', detail: 'Added financial analysis memo to case file.' },
  { id: 'A-03', time: '2026-07-22T19:35:00+05:30', actor: 'Insp. Ramesh Gowda', role: 'Investigating Officer', action: 'Created FIR', target: 'FIR 0251/2026', targetType: 'fir', detail: 'Mobile phone snatching — Majestic bus stand.' },
  { id: 'A-04', time: '2026-07-22T18:10:00+05:30', actor: 'PSI Divya R', role: 'Sub-Inspector', action: 'Linked evidence', target: 'E-702 → FIR 0245/2026', targetType: 'evidence', detail: 'Recovered mobile phone sent for IMEI analysis.' },
  { id: 'A-05', time: '2026-07-22T16:20:00+05:30', actor: 'ACP South Division', role: 'Supervisor', action: 'Requested review', target: 'FIR 0219/2026', targetType: 'fir', detail: 'Charge review requested with priority.' },
  { id: 'A-06', time: '2026-07-21T14:45:00+05:30', actor: 'Insp. Meera Kulkarni', role: 'Investigating Officer', action: 'Verified AI finding', target: 'AI-02 — V-501 ↔ F-2388', targetType: 'ai-finding', detail: 'Confirmed against CCTV canvass notes.' },
  { id: 'A-07', time: '2026-07-21T10:15:00+05:30', actor: 'AI Investigator', role: 'System', action: 'Generated finding', target: 'AI-02 — Vehicle link', targetType: 'ai-finding', detail: 'Confidence 74%.' },
  { id: 'A-08', time: '2026-07-20T18:35:00+05:30', actor: 'Insp. Meera Kulkarni', role: 'Investigating Officer', action: 'Rejected AI finding', target: 'AI-05 — Collection network', targetType: 'ai-finding', detail: 'Collector attribution "R.K." not established; sent back for re-analysis.' },
  { id: 'A-09', time: '2026-07-20T17:55:00+05:30', actor: 'PSI Divya R', role: 'Sub-Inspector', action: 'Linked evidence', target: 'E-708 → FIR 0148/2026', targetType: 'evidence', detail: 'Ledger seized under panchnama.' },
  { id: 'A-10', time: '2026-07-19T11:50:00+05:30', actor: 'Insp. Ramesh Gowda', role: 'Investigating Officer', action: 'Verified AI finding', target: 'AI-04 — Theft pattern', targetType: 'ai-finding', detail: 'MO match confirmed against case files 0187, 0203.' },
  { id: 'A-11', time: '2026-07-18T07:55:00+05:30', actor: 'PSI Divya R', role: 'Sub-Inspector', action: 'Created FIR', target: 'FIR 0232/2026', targetType: 'fir', detail: 'House burglary — Indiranagar.' },
  { id: 'A-12', time: '2026-07-08T11:00:00+05:30', actor: 'PSI Anand T', role: 'Sub-Inspector', action: 'Closed investigation', target: 'FIR 0096/2026', targetType: 'fir', detail: 'Charge sheet filed.' },
]

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'N-01', title: 'AI finding awaiting verification', body: 'AI-01 links FIR 0245/2026 and FIR 0148/2026 through a financial trail (82% confidence). Review and verify against source records.', time: '2026-07-22T21:06:00+05:30', kind: 'verification', actionRequired: true, read: false },
  { id: 'N-02', title: 'Charge review due — FIR 0219/2026', body: 'ACP South Division requested charge review. Due within 48 hours.', time: '2026-07-22T16:21:00+05:30', kind: 'deadline', actionRequired: true, read: false },
  { id: 'N-03', title: 'New FIR assigned to your station', body: 'FIR 0251/2026 (Majestic snatching) registered at Upparpet PS and shared for pattern correlation.', time: '2026-07-22T19:36:00+05:30', kind: 'assignment', actionRequired: false, read: false },
  { id: 'N-04', title: 'FSL result expected', body: 'Fingerprint analysis for E-705 (FIR 0232/2026) expected by 24 Jul.', time: '2026-07-21T09:00:00+05:30', kind: 'system', actionRequired: false, read: true },
  { id: 'N-05', title: 'Escalation: repeat-offender alert', body: 'Ravi Kumar S now linked to 3 open FIRs. Supervisor notified per policy.', time: '2026-07-21T14:50:00+05:30', kind: 'escalation', actionRequired: true, read: true },
]

/* ---------------------------- helpers ---------------------------- */

export const firById = (id: string) => FIRS.find(f => f.id === id)
export const personById = (id: string) => PERSONS.find(p => p.id === id)
export const evidenceById = (id: string) => EVIDENCE.find(e => e.id === id)
export const findingById = (id: string) => AI_FINDINGS.find(a => a.id === id)
export const vehicleById = (id: string) => VEHICLES.find(v => v.id === id)
export const locationById = (id: string) => LOCATIONS.find(l => l.id === id)

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export const DISTRICTS = [
  'Bagalkote', 'Ballari', 'Belagavi City', 'Bengaluru City', 'Bengaluru Rural', 'Bidar', 'Chamarajanagara', 'Chikkaballapura',
  'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Hubballi-Dharwad City',
  'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mangaluru City', 'Mysuru City', 'Mysuru District', 'Raichur', 'Ramanagara',
  'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgiri',
]

export const LANGUAGES = [
  { code: 'kn', label: 'ಕನ್ನಡ — Kannada' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी — Hindi' },
  { code: 'ur', label: 'اردو — Urdu' },
]

/* ---------------------- dashboard trend series ---------------------- */

export type MetricTrend = { series: number[]; delta: number; deltaLabel: string }

/** Last-7-day series per Command Centre metric (index 6 = today). */
export const METRIC_TRENDS: Record<string, MetricTrend> = {
  'Active FIRs': { series: [4, 4, 5, 5, 6, 5, 5], delta: 1, deltaLabel: '+1 vs last week' },
  'Pending reviews': { series: [0, 0, 1, 1, 1, 1, 1], delta: 1, deltaLabel: '+1 vs last week' },
  'Linked persons': { series: [6, 6, 7, 7, 7, 8, 8], delta: 2, deltaLabel: '+2 vs last week' },
  'AI findings to verify': { series: [1, 2, 2, 3, 2, 2, 2], delta: 1, deltaLabel: '+1 vs last week' },
  'Priority FIRs': { series: [2, 2, 3, 3, 3, 3, 3], delta: 1, deltaLabel: '+1 vs last week' },
}

/** FIRs registered per day across the division, last 7 days (index 6 = today). */
export const WEEKLY_INTAKE: { day: string; count: number }[] = [
  { day: 'Thu', count: 3 },
  { day: 'Fri', count: 5 },
  { day: 'Sat', count: 2 },
  { day: 'Sun', count: 4 },
  { day: 'Mon', count: 6 },
  { day: 'Tue', count: 4 },
  { day: 'Wed', count: 7 },
]

/* ---------------------- Crime Intelligence & Predictive Datasets ---------------------- */

export type CrimeHotspot = {
  id: string
  district: string
  locationName: string
  lat: number
  lng: number
  crimeCount: number
  dominantCrimeType: string
  riskLevel: 'critical' | 'high' | 'moderate'
  peakHours: string
  predictedTrend: 'increasing' | 'stable' | 'decreasing'
}

export const CRIME_HOTSPOTS: CrimeHotspot[] = [
  {
    id: 'HS-01',
    district: 'Bengaluru City',
    locationName: 'Madiwala Market & Hosur Road Junction',
    lat: 12.9226,
    lng: 77.6174,
    crimeCount: 38,
    dominantCrimeType: 'Night Vehicle Theft & Chain Snatching',
    riskLevel: 'critical',
    peakHours: '01:00 AM – 04:30 AM',
    predictedTrend: 'increasing',
  },
  {
    id: 'HS-02',
    district: 'Bengaluru City',
    locationName: 'KR Market & Cottonpet Main Road',
    lat: 12.9657,
    lng: 77.5762,
    crimeCount: 29,
    dominantCrimeType: 'Commercial Burglary & Pickpocketing',
    riskLevel: 'high',
    peakHours: '05:00 PM – 09:00 PM',
    predictedTrend: 'stable',
  },
  {
    id: 'HS-03',
    district: 'Mysuru City',
    locationName: 'Devaraja Market & Bus Stand Corridor',
    lat: 12.3087,
    lng: 76.6531,
    crimeCount: 22,
    dominantCrimeType: 'Tourist Pickpocketing & ATM Fraud',
    riskLevel: 'moderate',
    peakHours: '11:00 AM – 03:00 PM',
    predictedTrend: 'increasing',
  },
  {
    id: 'HS-04',
    district: 'Hubballi-Dharwad City',
    locationName: 'Old Bus Stand Road & Lamington Road',
    lat: 15.3647,
    lng: 75.124,
    crimeCount: 19,
    dominantCrimeType: 'Two-Wheeler Theft Syndicate',
    riskLevel: 'high',
    peakHours: '08:00 PM – 11:30 PM',
    predictedTrend: 'decreasing',
  },
  {
    id: 'HS-05',
    district: 'Belagavi City',
    locationName: 'Kirloskar Road & Khade Bazar',
    lat: 15.8497,
    lng: 74.5086,
    crimeCount: 16,
    dominantCrimeType: 'Cyber SIM Spoofing & Financial Cheating',
    riskLevel: 'high',
    peakHours: '10:00 AM – 06:00 PM',
    predictedTrend: 'increasing',
  },
]

export type PredictiveEarlyWarning = {
  id: string
  title: string
  description: string
  district: string
  riskCategory: 'Syndicate Movement' | 'Recidivist Activity' | 'Cyber Spike' | 'Public Order'
  confidence: number
  recommendedAction: string
  createdAt: string
}

export const PREDICTIVE_EARLY_WARNINGS: PredictiveEarlyWarning[] = [
  {
    id: 'EW-901',
    title: 'Inter-district Two-Wheeler Theft Syndicate Active',
    description: 'AI Modus Operandi matcher detected identical master-key lock picking patterns in Bengaluru South & Mandya. High probability of cross-border fencing near Hosur border.',
    district: 'Bengaluru City / Mandya',
    riskCategory: 'Syndicate Movement',
    confidence: 0.92,
    recommendedAction: 'Deploy midnight check-posts on NH-44 & alert Hosur Road police checkpoints.',
    createdAt: '2026-07-25T08:30:00+05:30',
  },
  {
    id: 'EW-902',
    title: 'Repeat Offender Release Spike Warning',
    description: '3 high-recidivism offenders (P-1001 linked network) released on bail within last 7 days. Historical data indicates 78% re-offence window within 14 days of release.',
    district: 'Bengaluru City',
    riskCategory: 'Recidivist Activity',
    confidence: 0.88,
    recommendedAction: 'Issue Section 107 BNSS / CrPC preventive surveillance notices to station IOs.',
    createdAt: '2026-07-24T16:45:00+05:30',
  },
  {
    id: 'EW-903',
    title: 'Cyber OTP/UPI Impersonation Campaign Alert',
    description: 'Socio-demographic behavioral model flagged 18 complaints targeting senior citizens in Malleshwaram & Jayanagar via spoofed KSEB electricity bill SMS links.',
    district: 'Bengaluru City',
    riskCategory: 'Cyber Spike',
    confidence: 0.95,
    recommendedAction: 'Broadcast public awareness alert via 1930 Cyber helpline & freeze identified mule accounts.',
    createdAt: '2026-07-25T10:15:00+05:30',
  },
]

export type ProactivePatrolRoute = {
  id: string
  routeName: string
  district: string
  assignedStation: string
  targetHotspots: string[]
  optimalTimeWindow: string
  efficiencyScore: number
  status: 'active' | 'scheduled' | 'completed'
}

export const PROACTIVE_PATROL_ROUTES: ProactivePatrolRoute[] = [
  {
    id: 'PR-101',
    routeName: 'Alpha Sector Midnight Patrol (BTM-Madiwala Belt)',
    district: 'Bengaluru City',
    assignedStation: 'Jayanagar PS & Madiwala PS',
    targetHotspots: ['Madiwala Market', 'Hosur Road Junction', 'BTM 2nd Stage'],
    optimalTimeWindow: '01:00 AM – 05:00 AM',
    efficiencyScore: 94,
    status: 'active',
  },
  {
    id: 'PR-102',
    routeName: 'Bravo Commercial Corridor Patrol (KR Market - Cottonpet)',
    district: 'Bengaluru City',
    assignedStation: 'City Market PS',
    targetHotspots: ['KR Market West Gate', 'Cottonpet Main Road'],
    optimalTimeWindow: '05:00 PM – 10:00 PM',
    efficiencyScore: 89,
    status: 'scheduled',
  },
  {
    id: 'PR-103',
    routeName: 'Charlie Cyber & Financial Vulnerability Grid',
    district: 'Bengaluru City',
    assignedStation: 'Cyber Crime Police Station',
    targetHotspots: ['Malleshwaram Banking Corridor', 'Indiranagar Tech Parks'],
    optimalTimeWindow: '10:00 AM – 04:00 PM',
    efficiencyScore: 91,
    status: 'active',
  },
]

export type CrimePatternCluster = {
  id: string
  patternName: string
  category: string
  affectedDistricts: string[]
  firCount: number
  suspectsIdentified: number
  moSignature: string
  riskLevel: 'critical' | 'high' | 'medium'
  keyInsight: string
}

export const CRIME_PATTERNS: CrimePatternCluster[] = [
  {
    id: 'CP-01',
    patternName: 'Organized Midnight Two-Wheeler Theft Network',
    category: 'Property Crime',
    affectedDistricts: ['Bengaluru City', 'Mandya', 'Ramanagara'],
    firCount: 14,
    suspectsIdentified: 5,
    moSignature: 'Master key lock picking; target vehicle parked in dark residential lanes between 02:00 and 04:30 AM.',
    riskLevel: 'critical',
    keyInsight: 'AI pattern extraction links FIR-2026-0187 with 3 regional FIRs via identical key tool marks.',
  },
  {
    id: 'CP-02',
    patternName: 'Elderly Utility Bill Impersonation Cyber Fraud',
    category: 'Cyber Financial Crime',
    affectedDistricts: ['Bengaluru City', 'Mysuru City', 'Belagavi City'],
    firCount: 23,
    suspectsIdentified: 4,
    moSignature: 'Spoofed SMS warning power disconnection; remote screen control app installation via APK link.',
    riskLevel: 'high',
    keyInsight: 'Socio-demographic profiling indicates 82% of victims are retired citizens aged > 60 years.',
  },
  {
    id: 'CP-03',
    patternName: 'Inter-State Fake Gold Loan Collateral Syndicate',
    category: 'Financial Impersonation',
    affectedDistricts: ['Hubballi-Dharwad City', 'Vijayapura', 'Belagavi City'],
    firCount: 9,
    suspectsIdentified: 3,
    moSignature: 'Copper-core gold plated jewelry pledged at NBFC branches using forged Aadhaar cards.',
    riskLevel: 'high',
    keyInsight: 'Entity network graph detected shared mobile contacts between suspects in Belagavi and Hubballi.',
  },
]

