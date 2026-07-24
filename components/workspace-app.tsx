'use client'

import {
  Activity,
  Bell,
  Bot,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FilePlus2,
  FileSearch,
  Fingerprint,
  LayoutDashboard,
  Link2,
  MapPin,
  Menu,
  Network,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
  UsersRound,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import styles from './workspace-app.module.css'

type Page = 'dashboard' | 'firs' | 'persons' | 'ai' | 'graph' | 'settings'

const firs = [
  {
    id: 'FIR-2026-0187',
    title: 'Organised vehicle theft',
    station: 'Indiranagar PS',
    status: 'Active',
    priority: 'Critical',
    officer: 'S. Rao',
    updated: '8 min ago',
  },
  {
    id: 'FIR-2026-0182',
    title: 'Financial impersonation',
    station: 'Cyber Crime PS',
    status: 'Review',
    priority: 'High',
    officer: 'N. Gowda',
    updated: '32 min ago',
  },
  {
    id: 'FIR-2026-0174',
    title: 'Missing property report',
    station: 'Jayanagar PS',
    status: 'Active',
    priority: 'Medium',
    officer: 'A. Kumar',
    updated: '1 hr ago',
  },
  {
    id: 'FIR-2026-0169',
    title: 'Inter-district fraud network',
    station: 'Mysuru Central',
    status: 'Restricted',
    priority: 'Critical',
    officer: 'V. Iyer',
    updated: 'Yesterday',
  },
  {
    id: 'FIR-2026-0158',
    title: 'Identity document misuse',
    station: 'Whitefield PS',
    status: 'Closed',
    priority: 'Low',
    officer: 'P. Shah',
    updated: '3 days ago',
  },
]

const persons = [
  {
    initials: 'AK',
    name: 'Arjun Kumar',
    meta: 'Male · 34 years',
    location: 'Bengaluru Urban',
    links: 4,
    risk: 'High relevance',
  },
  { initials: 'SN', name: 'Sahana N.', meta: 'Female · 29 years', location: 'Mysuru', links: 2, risk: 'Witness' },
  { initials: 'RM', name: 'Rafiq M.', meta: 'Male · 41 years', location: 'Belagavi', links: 7, risk: 'Critical link' },
  {
    initials: 'PJ',
    name: 'Priya Joshi',
    meta: 'Female · 37 years',
    location: 'Bengaluru Rural',
    links: 3,
    risk: 'Person of interest',
  },
]

const nav = [
  { page: 'dashboard' as const, label: 'Command centre', icon: LayoutDashboard },
  { page: 'firs' as const, label: 'FIRs', icon: FileSearch },
  { page: 'persons' as const, label: 'Persons', icon: UserRoundSearch },
  { page: 'ai' as const, label: 'AI investigator', icon: Bot },
  { page: 'graph' as const, label: 'Evidence graph', icon: Network, badge: 'New' },
  { page: 'settings' as const, label: 'Settings', icon: Settings },
]

function Status({ value }: { value: string }) {
  return <span className={`${styles.status} ${styles[value.toLowerCase().replace(' ', '')]}`}>{value}</span>
}

export default function WorkspaceApp({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedFir, setSelectedFir] = useState<(typeof firs)[number] | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiAnswer, setAiAnswer] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [compact, setCompact] = useState(false)
  const [toast, setToast] = useState('')

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const filteredFirs = useMemo(() => {
    const term = query.trim().toLowerCase()
    return term ? firs.filter((fir) => Object.values(fir).some((value) => value.toLowerCase().includes(term))) : firs
  }, [query])

  const go = (next: Page) => {
    setPage(next)
    setSidebarOpen(false)
  }

  return (
    <div className={`${styles.workspace} ${compact ? styles.compact : ''}`}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <Fingerprint size={19} />
          </span>
          <span>
            <strong>KURUHU</strong>
            <small>Intelligence workspace</small>
          </span>
          <button className={styles.mobileClose} onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>
        <div className={styles.workspaceChip}>
          <span className={styles.liveDot} />
          <span>Karnataka workspace</span>
          <ChevronDown size={14} />
        </div>
        <nav className={styles.nav} aria-label="Workspace navigation">
          <p>Operations</p>
          {nav.slice(0, 5).map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.page}
                className={page === item.page ? styles.activeNav : ''}
                onClick={() => go(item.page)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <em>{item.badge}</em>}
              </button>
            )
          })}
          <p>Account</p>
          {nav.slice(5).map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.page}
                className={page === item.page ? styles.activeNav : ''}
                onClick={() => go(item.page)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className={styles.securityCard}>
          <ShieldCheck size={20} />
          <div>
            <strong>Protected session</strong>
            <small>Activity is securely audited</small>
          </div>
        </div>
        <button className={styles.profile} onClick={onLogout}>
          <span>SR</span>
          <div>
            <strong>Shreya Rao</strong>
            <small>Lead investigator</small>
          </div>
          <ChevronRight size={16} />
        </button>
      </aside>

      {sidebarOpen && (
        <button className={styles.scrim} onClick={() => setSidebarOpen(false)} aria-label="Close navigation overlay" />
      )}

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={21} />
          </button>
          <div className={styles.globalSearch}>
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') go('firs')
              }}
              placeholder="Search FIRs, persons, stations…"
            />
          </div>
          <div className={styles.topActions}>
            <button
              aria-label="Notifications"
              onClick={() => notify('You have 3 investigation updates awaiting review.')}
            >
              <Bell size={19} />
              <span />
            </button>
            <div className={styles.rolePill}>
              <ShieldCheck size={15} />
              Investigator
            </div>
            <span className={styles.avatar}>SR</span>
          </div>
        </header>

        <div className={styles.page} key={page}>
          {page === 'dashboard' && <Dashboard go={go} setSelectedFir={setSelectedFir} notify={notify} />}
          {page === 'firs' && (
            <FirsPage
              items={filteredFirs}
              query={query}
              setQuery={setQuery}
              setSelectedFir={setSelectedFir}
              notify={notify}
            />
          )}
          {page === 'persons' && <PersonsPage go={go} notify={notify} />}
          {page === 'ai' && (
            <AiPage
              prompt={aiPrompt}
              setPrompt={setAiPrompt}
              answered={aiAnswer}
              ask={() => setAiAnswer(true)}
              go={go}
            />
          )}
          {page === 'graph' && <GraphPage setSelectedFir={setSelectedFir} notify={notify} />}
          {page === 'settings' && (
            <SettingsPage
              notifications={notifications}
              setNotifications={setNotifications}
              compact={compact}
              setCompact={setCompact}
              notify={notify}
            />
          )}
        </div>
      </main>

      {selectedFir && <FirDrawer fir={selectedFir} close={() => setSelectedFir(null)} notify={notify} />}
      {toast && (
        <div className={styles.toast}>
          <ShieldCheck size={17} />
          {toast}
        </div>
      )}
    </div>
  )
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className={styles.pageHeading}>
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

function Dashboard({
  go,
  setSelectedFir,
  notify,
}: {
  go: (page: Page) => void
  setSelectedFir: (fir: (typeof firs)[number]) => void
  notify: (message: string) => void
}) {
  return (
    <>
      <PageHeading
        eyebrow="Wednesday · 22 July"
        title="Good evening, Shreya"
        description="Here is what needs your attention across the investigation workspace."
        action={
          <button
            className={styles.primaryButton}
            onClick={() => {
              go('firs')
              notify('FIR workspace opened. Use New FIR to begin a record.')
            }}
          >
            <FilePlus2 size={17} />
            Create FIR
          </button>
        }
      />
      <section className={styles.heroPanel}>
        <div>
          <span className={styles.heroLabel}>
            <FileSearch size={15} />
            Case review summary
          </span>
          <h2>Three connected cases need review</h2>
          <p>New links were detected between two persons, a vehicle, and FIR-2026-0187.</p>
          <button onClick={() => go('graph')}>
            Open evidence graph <ChevronRight size={16} />
          </button>
        </div>
        <div className={styles.pulseVisual}>
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>
      <section className={styles.metrics}>
        {[
          ['Active FIRs', '1,204', '+18 this week', FileSearch],
          ['Pending review', '86', '12 overdue', Clock3],
          ['Linked persons', '6,120', '24 new matches', UsersRound],
          ['AI findings', '38', '7 need verification', Sparkles],
        ].map(([label, value, note, Icon]) => (
          <article key={label as string}>
            <div>
              <Icon size={19} />
            </div>
            <span>{label as string}</span>
            <strong>{value as string}</strong>
            <small>{note as string}</small>
          </article>
        ))}
      </section>
      <div className={styles.dashboardGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Priority FIRs</h2>
              <p>Updated across your jurisdiction</p>
            </div>
            <button onClick={() => go('firs')}>
              View all <ChevronRight size={15} />
            </button>
          </div>
          <div className={styles.firList}>
            {firs.slice(0, 4).map((fir) => (
              <button key={fir.id} onClick={() => setSelectedFir(fir)}>
                <span className={styles.firIcon}>
                  <FileSearch size={17} />
                </span>
                <div>
                  <strong>{fir.id}</strong>
                  <small>
                    {fir.title} · {fir.station}
                  </small>
                </div>
                <Status value={fir.status} />
                <time>{fir.updated}</time>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Live activity</h2>
              <p>Latest verified updates</p>
            </div>
            <span className={styles.liveLabel}>
              <i />
              Live
            </span>
          </div>
          <div className={styles.timeline}>
            {[
              ['S. Rao updated FIR-2026-0187', 'Statement added', '8 min'],
              ['AI Investigator found 3 links', 'Verification required', '21 min'],
              ['N. Gowda assigned a reviewer', 'FIR-2026-0182', '32 min'],
              ['Audit export completed', 'June compliance review', '1 hr'],
            ].map(([title, note, time], index) => (
              <div key={title}>
                <span className={index === 1 ? styles.aiEvent : ''}>
                  {index === 1 ? <Sparkles size={14} /> : <Activity size={14} />}
                </span>
                <p>
                  <strong>{title}</strong>
                  <small>{note}</small>
                </p>
                <time>{time}</time>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function FirsPage({
  items,
  query,
  setQuery,
  setSelectedFir,
  notify,
}: {
  items: typeof firs
  query: string
  setQuery: (value: string) => void
  setSelectedFir: (fir: (typeof firs)[number]) => void
  notify: (message: string) => void
}) {
  const [filter, setFilter] = useState('All')
  const [recentFirst, setRecentFirst] = useState(true)
  const filtered = filter === 'All' ? items : items.filter((item) => item.status === filter)
  const visible = recentFirst ? filtered : [...filtered].reverse()
  return (
    <>
      <PageHeading
        eyebrow="Case operations"
        title="FIR command centre"
        description="Search, triage, and manage reports across every connected station."
        action={
          <button className={styles.primaryButton} onClick={() => notify('New FIR form opened in draft mode.')}>
            <FilePlus2 size={17} />
            New FIR
          </button>
        }
      />
      <div className={styles.toolbar}>
        <div className={styles.localSearch}>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by FIR, title, station, or officer"
          />
        </div>
        <div className={styles.filterTabs}>
          {['All', 'Active', 'Review', 'Restricted', 'Closed'].map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={filter === item ? styles.selectedFilter : ''}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <section className={styles.tablePanel}>
        <div className={styles.tableMeta}>
          <span>{visible.length} records</span>
          <button onClick={() => setRecentFirst((value) => !value)}>
            {recentFirst ? 'Recently updated' : 'Oldest first'} <ChevronDown size={14} />
          </button>
        </div>
        <div className={styles.firTable}>
          <div className={styles.tableHead}>
            <span>FIR</span>
            <span>Station</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Officer</span>
            <span>Updated</span>
            <span />
          </div>
          {visible.map((fir) => (
            <button className={styles.tableRow} key={fir.id} onClick={() => setSelectedFir(fir)}>
              <span>
                <strong>{fir.id}</strong>
                <small>{fir.title}</small>
              </span>
              <span>{fir.station}</span>
              <Status value={fir.status} />
              <span className={styles.priority}>
                <i className={styles[fir.priority.toLowerCase()]} />
                {fir.priority}
              </span>
              <span>{fir.officer}</span>
              <time>{fir.updated}</time>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </section>
    </>
  )
}

function PersonsPage({ go, notify }: { go: (page: Page) => void; notify: (message: string) => void }) {
  const [search, setSearch] = useState('')
  const shown = persons.filter(
    (person) =>
      person.name.toLowerCase().includes(search.toLowerCase()) ||
      person.location.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <>
      <PageHeading
        eyebrow="Identity intelligence"
        title="Person search"
        description="Discover identities, relationships, aliases, and linked case history."
      />
      <div className={styles.personSearch}>
        <Search size={20} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, identifier, alias, phone, or location"
        />
        <button
          onClick={() =>
            notify(
              search.trim()
                ? `${shown.length} matching person records found.`
                : 'Enter a name, identifier, or location to search.',
            )
          }
        >
          Search
        </button>
      </div>
      <div className={styles.personLayout}>
        <section>
          <div className={styles.resultTitle}>
            <span>{shown.length} likely matches</span>
            <small>Sorted by relevance</small>
          </div>
          <div className={styles.personGrid}>
            {shown.map((person) => (
              <article key={person.name}>
                <div className={styles.personTop}>
                  <span>{person.initials}</span>
                  <Status value={person.risk} />
                </div>
                <h2>{person.name}</h2>
                <p>{person.meta}</p>
                <div>
                  <MapPin size={15} />
                  {person.location}
                </div>
                <footer>
                  <span>
                    <Link2 size={14} />
                    {person.links} linked FIRs
                  </span>
                  <button onClick={() => go('graph')}>
                    Explore <ChevronRight size={14} />
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>
        <aside className={styles.searchTips}>
          <Fingerprint size={24} />
          <h2>Search with context</h2>
          <p>Combine descriptive details to reduce false matches.</p>
          <ul>
            <li>Full or partial name</li>
            <li>Known alias or phone</li>
            <li>District or station</li>
            <li>Linked vehicle or FIR</li>
          </ul>
        </aside>
      </div>
    </>
  )
}

function AiPage({
  prompt,
  setPrompt,
  answered,
  ask,
  go,
}: {
  prompt: string
  setPrompt: (value: string) => void
  answered: boolean
  ask: () => void
  go: (page: Page) => void
}) {
  return (
    <>
      <PageHeading
        eyebrow="Source-grounded assistance"
        title="AI investigator"
        description="Ask questions across permitted records. Every finding remains traceable to its source."
      />
      <section className={styles.aiWorkspace}>
        <div className={styles.aiIntro}>
          <span>
            <Sparkles size={22} />
          </span>
          <div>
            <h2>What would you like to investigate?</h2>
            <p>Use names, FIR numbers, dates, locations, or relationship questions.</p>
          </div>
        </div>
        <div className={styles.promptBox}>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: Find connections between FIR-2026-0187 and recent vehicle theft reports in Bengaluru…"
          />
          <footer>
            <span>Sources limited to your access</span>
            <button disabled={!prompt.trim()} onClick={ask}>
              <Sparkles size={16} />
              Investigate
            </button>
          </footer>
        </div>
        {!answered ? (
          <div className={styles.suggestions}>
            {[
              'Summarise the latest activity on FIR-2026-0187',
              'Find persons connected to more than three active FIRs',
              'Compare recent vehicle theft patterns by district',
            ].map((suggestion) => (
              <button key={suggestion} onClick={() => setPrompt(suggestion)}>
                {suggestion}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        ) : (
          <article className={styles.answer}>
            <div className={styles.answerHeader}>
              <span>
                <Bot size={19} />
              </span>
              <div>
                <strong>Investigation brief</strong>
                <small>Generated from 7 permitted records · verify before use</small>
              </div>
            </div>
            <p>
              The available records indicate a probable relationship between <strong>FIR-2026-0187</strong> and two
              recent vehicle theft reports. A shared phone identifier and recurring location appear across the source
              records.
            </p>
            <div className={styles.findings}>
              <div>
                <span>01</span>
                <p>
                  <strong>Shared identifier</strong>
                  <small>One phone number appears in three witness statements.</small>
                </p>
              </div>
              <div>
                <span>02</span>
                <p>
                  <strong>Location pattern</strong>
                  <small>Incidents cluster within a 4.2 km corridor.</small>
                </p>
              </div>
            </div>
            <div className={styles.citations}>
              <strong>3 citations</strong>
              <button onClick={() => go('graph')}>
                Open evidence graph <Network size={15} />
              </button>
            </div>
          </article>
        )}
      </section>
    </>
  )
}

function GraphPage({
  setSelectedFir,
  notify,
}: {
  setSelectedFir: (fir: (typeof firs)[number]) => void
  notify: (message: string) => void
}) {
  const [range, setRange] = useState('90 days')
  return (
    <>
      <PageHeading
        eyebrow="KURUHU intelligence layer"
        title="Evidence graph"
        description="Explore verified relationships across people, FIRs, locations, vehicles, and evidence."
        action={
          <button
            className={styles.secondaryButton}
            onClick={() => notify('Relationship editor opened in review mode.')}
          >
            <Link2 size={16} />
            Add relationship
          </button>
        }
      />
      <section className={styles.graphShell}>
        <div className={styles.graphToolbar}>
          <div>
            <span className={styles.legendPerson} />
            Person <span className={styles.legendFir} />
            FIR <span className={styles.legendPlace} />
            Location
          </div>
          <button
            onClick={() =>
              setRange((value) => (value === '90 days' ? '30 days' : value === '30 days' ? '1 year' : '90 days'))
            }
          >
            Last {range} <ChevronDown size={14} />
          </button>
        </div>
        <div className={styles.graphCanvas}>
          <svg viewBox="0 0 850 470" aria-label="Interactive evidence relationship graph">
            <g className={styles.edges}>
              <line x1="425" y1="220" x2="180" y2="110" />
              <line x1="425" y1="220" x2="680" y2="110" />
              <line x1="425" y1="220" x2="170" y2="355" />
              <line x1="425" y1="220" x2="680" y2="355" />
              <line x1="180" y1="110" x2="680" y2="110" />
              <line x1="170" y1="355" x2="680" y2="355" />
            </g>
            <g className={styles.nodes}>
              <g transform="translate(425 220)">
                <circle r="58" className={styles.firNode} />
                <text y="-4">FIR</text>
                <text y="17">0187</text>
              </g>
              <g transform="translate(180 110)">
                <circle r="43" className={styles.personNode} />
                <text y="4">Arjun K.</text>
              </g>
              <g transform="translate(680 110)">
                <circle r="43" className={styles.personNode} />
                <text y="4">Rafiq M.</text>
              </g>
              <g transform="translate(170 355)">
                <circle r="43" className={styles.placeNode} />
                <text y="4">Indiranagar</text>
              </g>
              <g transform="translate(680 355)">
                <circle r="43" className={styles.evidenceNode} />
                <text y="4">KA-03-MX</text>
              </g>
            </g>
          </svg>
          <div className={styles.graphHint}>
            <Network size={16} />
            Drag nodes to explore · select any relationship for evidence
          </div>
        </div>
        <aside className={styles.graphInspector}>
          <span>Selected entity</span>
          <h2>FIR-2026-0187</h2>
          <p>Organised vehicle theft</p>
          <dl>
            <div>
              <dt>Connections</dt>
              <dd>8</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>Verified</dd>
            </div>
            <div>
              <dt>Last update</dt>
              <dd>8 min</dd>
            </div>
          </dl>
          <button onClick={() => setSelectedFir(firs[0])}>
            Open FIR record <ChevronRight size={15} />
          </button>
        </aside>
      </section>
    </>
  )
}

function SettingsPage({
  notifications,
  setNotifications,
  compact,
  setCompact,
  notify,
}: {
  notifications: boolean
  setNotifications: (value: boolean) => void
  compact: boolean
  setCompact: (value: boolean) => void
  notify: (message: string) => void
}) {
  const [section, setSection] = useState('Profile')
  return (
    <>
      <PageHeading
        eyebrow="Personal workspace"
        title="Settings"
        description="Manage your profile, workspace preferences, security, and notifications."
      />
      <div className={styles.settingsLayout}>
        <nav>
          {[
            [CircleUserRound, 'Profile'],
            [Bell, 'Notifications'],
            [ShieldCheck, 'Security'],
            [Settings, 'Appearance'],
          ].map(([Icon, label]) => {
            const ItemIcon = Icon as typeof CircleUserRound
            return (
              <button
                key={label as string}
                className={section === label ? styles.settingsActive : ''}
                onClick={() => {
                  setSection(label as string)
                  notify(`${label as string} settings selected.`)
                }}
              >
                <ItemIcon size={17} />
                {label as string}
              </button>
            )
          })}
        </nav>
        <section className={styles.settingsPanel}>
          <div className={styles.settingsHeader}>
            <span className={styles.largeAvatar}>SR</span>
            <div>
              <h2>{section}</h2>
              <p>Shreya Rao · Lead investigator · Bengaluru Urban</p>
            </div>
            <button onClick={() => notify('Profile editing controls are now enabled.')}>Edit profile</button>
          </div>
          <div className={styles.settingGroup}>
            <h3>Workspace preferences</h3>
            <Setting
              label="Live notifications"
              description="Receive updates when assigned FIRs or linked records change."
              checked={notifications}
              change={setNotifications}
            />
            <Setting
              label="Compact information density"
              description="Show more operational data within tables and cards."
              checked={compact}
              change={setCompact}
            />
          </div>
          <div className={styles.settingGroup}>
            <h3>Security</h3>
            <div className={styles.securityRow}>
              <ShieldCheck size={20} />
              <div>
                <strong>Session protected</strong>
                <small>Last verified today at 18:42 · Bengaluru</small>
              </div>
              <button onClick={() => notify('No unfamiliar sessions were found.')}>Review sessions</button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

function Setting({
  label,
  description,
  checked,
  change,
}: {
  label: string
  description: string
  checked: boolean
  change: (value: boolean) => void
}) {
  return (
    <label className={styles.setting}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => change(event.target.checked)} />
      <i />
    </label>
  )
}

function FirDrawer({
  fir,
  close,
  notify,
}: {
  fir: (typeof firs)[number]
  close: () => void
  notify: (message: string) => void
}) {
  return (
    <div className={styles.drawerLayer}>
      <button className={styles.drawerScrim} onClick={close} aria-label="Close FIR details" />
      <aside className={styles.drawer}>
        <header>
          <div>
            <span>FIR record</span>
            <h2>{fir.id}</h2>
          </div>
          <button onClick={close}>
            <X size={20} />
          </button>
        </header>
        <Status value={fir.status} />
        <h3>{fir.title}</h3>
        <p className={styles.drawerLead}>
          A concise operational preview of the selected record and its latest verified activity.
        </p>
        <dl className={styles.details}>
          <div>
            <dt>Station</dt>
            <dd>{fir.station}</dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>{fir.priority}</dd>
          </div>
          <div>
            <dt>Assigned officer</dt>
            <dd>{fir.officer}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{fir.updated}</dd>
          </div>
        </dl>
        <section>
          <h4>Connected intelligence</h4>
          <button onClick={() => notify('Linked-person records loaded for review.')}>
            <UsersRound size={17} />
            <span>
              <strong>4 linked persons</strong>
              <small>2 require verification</small>
            </span>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => notify('Evidence graph opened for this FIR.')}>
            <Network size={17} />
            <span>
              <strong>8 graph relationships</strong>
              <small>1 newly detected</small>
            </span>
            <ChevronRight size={16} />
          </button>
        </section>
        <footer>
          <button className={styles.secondaryButton} onClick={() => notify('FIR activity timeline opened.')}>
            View activity
          </button>
          <button className={styles.primaryButton} onClick={() => notify(`${fir.id} opened in full-record mode.`)}>
            Open full FIR
          </button>
        </footer>
      </aside>
    </div>
  )
}
