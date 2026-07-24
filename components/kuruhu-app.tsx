'use client'

import { useState } from 'react'
import WorkspaceApp from './workspace-app'

const COLORS = {
  bg: '#000000',
  black: '#000000',
  cardBlack: '#23063B',
  altBg: '#12031f',
  green: '#D6AD3F',
  greenDark: '#B02B1E',
  greenLight: '#D4C7C3',
  linkGreen: '#D6AD3F',
  yellow: '#D6AD3F',
  red: '#B02B1E',
  textMuted: '#688387',
}

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

const TRUST_HIGHLIGHTS = ['Role-based access', 'Traceable activity', 'Source-linked AI insights', 'Secure case records']

const PLATFORM_POINTS = [
  'FIR and case management',
  'Person and relationship search',
  'AI-assisted investigation',
  'Analytics and operational visibility',
  'Audit and administrative control',
]

const OVERVIEW_TILES = [
  { label: 'Connected FIRs', value: '2,480' },
  { label: 'Linked Persons', value: '6,120' },
  { label: 'Districts covered', value: '29' },
  { label: 'Avg. lookup time', value: '4s' },
]

const FEATURES = [
  { title: 'FIR Management', desc: 'Search, create, review, and update case records.' },
  { title: 'Person Intelligence', desc: 'Find person profiles and connected FIRs.' },
  { title: 'AI Investigator', desc: 'Explore information with source-linked findings and citations.' },
  { title: 'Analytics', desc: 'Monitor operational patterns and key metrics.' },
  { title: 'Audit Trail', desc: 'Review traceable user and system activity.' },
  { title: 'Role-Based Administration', desc: 'Control users, roles, and permissions.' },
]

const STEP_COLORS = [COLORS.green, COLORS.yellow, COLORS.red, COLORS.green]
const STEPS = [
  { title: 'Sign in securely', desc: 'Authenticate with your credentials.' },
  { title: 'Search or create a record', desc: 'Find an existing FIR or start a new one.' },
  { title: 'Investigate connected information', desc: 'Trace people, records, and history.' },
  { title: 'Review findings and act', desc: 'Take authorized action within your role.' },
].map((s, i) => ({ ...s, n: i + 1, color: STEP_COLORS[i] }))

const ROLES = [
  { name: 'Investigator', desc: 'Manages assigned FIRs' },
  { name: 'Supervisor', desc: 'Reviews team progress' },
  { name: 'Analyst', desc: 'Explores patterns & trends' },
  { name: 'Auditor', desc: 'Reviews traceable activity' },
  { name: 'Administrator', desc: 'Manages users & roles' },
]

const SECURITY_ITEMS = [
  { title: 'Role-based access', desc: 'Every module is gated by assigned role and permissions.' },
  { title: 'Permission-controlled modules', desc: 'Users only see the tools they are authorized to use.' },
  { title: 'Protected workspace routes', desc: 'Authenticated routes verify session on every request.' },
  { title: 'Traceable audit activity', desc: 'Key actions are logged with user, time, and context.' },
  { title: 'Restricted-data indicators', desc: 'Sensitive records are visibly marked as restricted.' },
  { title: 'Secure session management', desc: 'Sessions expire and refresh under defined policy.' },
]

const BENEFITS = [
  'Faster access to connected information',
  'Clearer investigation workflows',
  'Better operational visibility',
  'Reduced navigation between disconnected records',
  'Traceable user activity',
  'Consistent permission enforcement',
]

const SUMMARY_CARDS = [
  { label: 'Active FIRs', value: '1,204' },
  { label: 'Pending Review', value: '86' },
  { label: 'Recently Updated', value: '312' },
  { label: 'Assigned to Me', value: '14' },
]

const FAQS = [
  {
    q: 'What is KURUHU?',
    a: 'KURUHU is a connected workspace for investigation and case management, bringing FIRs, person records, insights, and administration into one system.',
  },
  { q: 'Who can access the workspace?', a: 'Access is limited to authorized personnel with role-based permissions.' },
  {
    q: 'How are permissions managed?',
    a: 'Administrators assign roles that determine which modules and actions each user can access.',
  },
  {
    q: 'What can the AI Investigator do?',
    a: 'It answers investigation-related questions with source-linked findings you can trace back to original records.',
  },
  {
    q: 'Are AI findings treated as evidence?',
    a: 'No. AI-generated findings must be verified against source records before consequential decisions are made.',
  },
  { q: 'Can users see linked FIR and person records?', a: 'Yes, where their role and permissions allow it.' },
  { q: 'Is user activity recorded?', a: 'Yes, key actions are logged for traceability and accountability.' },
  {
    q: 'What happens when a user lacks permission?',
    a: 'The relevant module or action is hidden or shown as restricted.',
  },
]

const DISTRICTS = [
  'Bengaluru (Urban)',
  'Bengaluru (Rural)',
  'Mysuru',
  'Belagavi',
  'Ballari',
  'Dakshina Kannada',
  'Kalaburagi',
  'Hassan',
  'Tumakuru',
  'Shivamogga',
]

type View = 'landing' | 'login' | 'forgot' | 'reset' | 'dashboard'

export default function KuruhuApp() {
  const [view, setView] = useState<View>('landing')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const [mobile, setMobile] = useState('')
  const [district, setDistrict] = useState('')
  const [language, setLanguage] = useState('en')
  const [agreed, setAgreed] = useState(false)
  const [loginErrors, setLoginErrors] = useState<{ mobile?: string; district?: string; agreed?: string }>({})
  const [loginLoading, setLoginLoading] = useState(false)

  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitted, setForgotSubmitted] = useState(false)
  const [forgotError, setForgotError] = useState('')

  const [role, setRole] = useState('Investigator')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const goToLogin = () => {
    setView('login')
    setMobileNavOpen(false)
  }
  const goToLanding = () => setView('landing')

  const handleLoginSubmit = () => {
    const errors: typeof loginErrors = {}
    if (!/^\d{10}$/.test(mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.'
    if (!district) errors.district = 'Please select your home district.'
    if (!agreed) errors.agreed = 'Please agree to the Terms & Privacy Policy.'
    if (Object.keys(errors).length) {
      setLoginErrors(errors)
      return
    }
    setLoginLoading(true)
    setLoginErrors({})
    setTimeout(() => {
      setLoginLoading(false)
      setView('dashboard')
    }, 900)
  }

  const cardStyle: React.CSSProperties = {
    borderRadius: 14,
    background: COLORS.cardBlack,
    border: '1px solid rgba(255,255,255,0.08)',
  }

  if (view === 'dashboard') {
    return <WorkspaceApp onLogout={goToLanding} />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: view === 'login' ? COLORS.black : COLORS.bg,
        color: '#f1f5f9',
        fontFamily: "'Public Sans', sans-serif",
      }}
    >
      <style>{`
        @keyframes kuruhuFloat { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-24px); } }
        @keyframes kuruhuFloat2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-24px,18px); } }
        @keyframes kuruhuPulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(214,173,63,0.5); } 50% { opacity: .7; box-shadow: 0 0 0 6px rgba(214,173,63,0); } }
        @keyframes kuruhuSpin { to { transform: rotate(360deg); } }
        @keyframes kuruhuFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .kuruhu-nav-link { position: relative; }
        .kuruhu-nav-link::after { content: ''; position: absolute; left: 0; bottom: -4px; width: 0; height: 2px; background: ${COLORS.linkGreen}; transition: width .25s ease; }
        .kuruhu-nav-link:hover::after { width: 100%; }
        .kuruhu-feature-card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .kuruhu-feature-card:hover { transform: translateY(-5px); box-shadow: 0 16px 34px -18px rgba(214,173,63,0.35); border-color: rgba(214,173,63,0.4); }
        .kuruhu-cta-btn { transition: transform .2s ease, box-shadow .2s ease; }
        .kuruhu-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -10px rgba(214,173,63,0.55); }
        .kuruhu-trust-dot { animation: kuruhuPulse 2.2s ease-in-out infinite; }
        @media (min-width: 860px) {
          .kuruhu-desktop-nav { display: flex !important; }
          .kuruhu-signin-desktop { display: inline-flex !important; }
          .kuruhu-hamburger { display: none !important; }
        }
        @media (max-width: 859px) {
          .kuruhu-grid-2,
          .kuruhu-grid-3,
          .kuruhu-grid-4 { grid-template-columns: minmax(0, 1fr) !important; }
          .kuruhu-hero { padding-top: 48px !important; gap: 36px !important; }
          .kuruhu-hero-title { font-size: clamp(2.25rem, 11vw, 3rem) !important; }
          .kuruhu-section { padding-top: 56px !important; padding-bottom: 56px !important; }
          .kuruhu-final-cta { padding: 32px 20px !important; }
        }
        @media (max-width: 700px) {
          .kuruhu-dashboard-sidebar { display: none !important; }
          .kuruhu-dashboard-content { padding: 22px 18px !important; }
          .kuruhu-dashboard-search { width: 180px !important; max-width: 48vw !important; }
        }
      `}</style>

      {view === 'landing' && (
        <div style={{ animation: 'kuruhuFade .4s ease' }}>
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 40,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ height: 3, display: 'flex' }}>
              <div style={{ flex: 1, background: COLORS.green }} />
              <div style={{ flex: 1, background: COLORS.yellow }} />
              <div style={{ flex: 1, background: COLORS.red }} />
            </div>
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `linear-gradient(135deg,${COLORS.green},${COLORS.greenDark})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Manrope',sans-serif",
                    fontWeight: 800,
                    fontSize: 15,
                    color: '#fff',
                  }}
                >
                  K
                </div>
                <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 18 }}>KURUHU</span>
              </div>
              <nav style={{ display: 'none', alignItems: 'center', gap: 28 }} className="kuruhu-desktop-nav">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="kuruhu-nav-link"
                    style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1', textDecoration: 'none' }}
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={goToLogin}
                  className="kuruhu-signin-desktop kuruhu-cta-btn"
                  style={{
                    display: 'none',
                    padding: '9px 20px',
                    borderRadius: 10,
                    background: COLORS.green,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMobileNavOpen((v) => !v)}
                  className="kuruhu-hamburger"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f1f5f9',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  ☰
                </button>
              </div>
            </div>
            {mobileNavOpen && (
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  padding: '16px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  background: COLORS.bg,
                }}
              >
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileNavOpen(false)}
                    style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', textDecoration: 'none' }}
                  >
                    {l.label}
                  </a>
                ))}
                <button
                  onClick={goToLogin}
                  style={{
                    marginTop: 6,
                    padding: '11px 18px',
                    borderRadius: 10,
                    background: COLORS.green,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Sign In
                </button>
              </div>
            )}
          </header>

          <section
            id="hero"
            className="kuruhu-hero kuruhu-grid-2"
            style={{
              position: 'relative',
              maxWidth: 1200,
              margin: '0 auto',
              padding: '72px 24px 56px',
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              gap: 56,
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -80,
                left: -60,
                width: 340,
                height: 340,
                borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(214,173,63,0.22),transparent 70%)',
                filter: 'blur(10px)',
                animation: 'kuruhuFloat 9s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -100,
                right: -40,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(239,68,68,0.22),transparent 70%)',
                filter: 'blur(10px)',
                animation: 'kuruhuFloat2 11s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: 999,
                  background: 'rgba(214,173,63,0.12)',
                  border: '1px solid rgba(214,173,63,0.3)',
                  color: COLORS.greenLight,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                  whiteSpace: 'nowrap',
                }}
              >
                Investigation Workspace
              </div>
              <h1
                className="kuruhu-hero-title"
                style={{
                  fontFamily: "'Manrope',sans-serif",
                  fontWeight: 800,
                  fontSize: 44,
                  lineHeight: 1.15,
                  margin: '0 0 18px',
                }}
              >
                Intelligent investigation. Connected information. Faster decisions.
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: COLORS.textMuted, margin: '0 0 28px', maxWidth: 520 }}>
                KURUHU brings FIRs, person records, investigative insights, analytics, and secure administration into
                one connected workspace.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
                <button
                  onClick={goToLogin}
                  className="kuruhu-cta-btn"
                  style={{
                    padding: '14px 26px',
                    borderRadius: 10,
                    background: COLORS.green,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sign In to Workspace
                </button>
                <a
                  href="#features"
                  style={{
                    padding: '14px 26px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#f1f5f9',
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                  }}
                >
                  Explore Features
                </a>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                🔒 Secure, role-based, permission-controlled access.
              </p>
            </div>
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                background: COLORS.cardBlack,
                boxShadow: '0 20px 50px -20px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: '#475569' }} />
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', minHeight: 280 }}>
                <div
                  style={{
                    background: COLORS.altBg,
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    padding: '16px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 18,
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(214,173,63,0.25)' }} />
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(255,255,255,0.08)' }}
                    />
                  ))}
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 52,
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      height: 120,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      marginBottom: 10,
                    }}
                  />
                  <div
                    style={{
                      height: 14,
                      width: '70%',
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.06)',
                      marginBottom: 8,
                    }}
                  />
                  <div style={{ height: 14, width: '45%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                </div>
              </div>
            </div>
          </section>

          <section
            className="kuruhu-grid-4"
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              padding: '0 24px 64px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4,1fr)',
              gap: 16,
            }}
          >
            {TRUST_HIGHLIGHTS.map((t) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 16px',
                  borderRadius: 12,
                  ...cardStyle,
                }}
              >
                <div
                  className="kuruhu-trust-dot"
                  style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.green, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{t}</span>
              </div>
            ))}
          </section>

          <section
            id="about"
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: COLORS.altBg,
              padding: '72px 24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="kuruhu-grid-2"
              style={{
                position: 'absolute',
                top: -60,
                right: '10%',
                width: 260,
                height: 260,
                borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(234,179,8,0.14),transparent 70%)',
                filter: 'blur(6px)',
                animation: 'kuruhuFloat 10s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -80,
                left: '5%',
                width: 260,
                height: 260,
                borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(239,68,68,0.13),transparent 70%)',
                filter: 'blur(6px)',
                animation: 'kuruhuFloat2 12s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'relative',
                maxWidth: 1200,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 56,
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 30, margin: '0 0 16px' }}>
                  One connected workspace for the full investigation lifecycle
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: COLORS.textMuted, margin: '0 0 20px' }}>
                  From first report to closed case, KURUHU keeps FIRs, people, insights and oversight in a single,
                  permission-aware system — so nothing is scattered across disconnected tools.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PLATFORM_POINTS.map((p) => (
                    <div
                      key={p}
                      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#cbd5e1' }}
                    >
                      <span style={{ color: COLORS.green, fontWeight: 800 }}>›</span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: COLORS.cardBlack,
                  padding: 20,
                  boxShadow: '0 20px 50px -20px rgba(0,0,0,0.6)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                  {OVERVIEW_TILES.map((t) => (
                    <div
                      key={t.label}
                      style={{
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        padding: 16,
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{t.label}</div>
                      <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 22 }}>{t.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 30, margin: '0 0 10px' }}>
                Everything an investigation team needs
              </h2>
              <p style={{ fontSize: 15, color: COLORS.textMuted, margin: 0 }}>
                Six connected modules, one consistent workspace.
              </p>
            </div>
            <div className="kuruhu-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="kuruhu-feature-card"
                  style={{ padding: 26, borderRadius: 14, ...cardStyle }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'rgba(214,173,63,0.15)',
                      border: '1px solid rgba(214,173,63,0.3)',
                      marginBottom: 16,
                    }}
                  />
                  <h3 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.6, margin: '0 0 12px' }}>
                    {f.desc}
                  </p>
                  <a
                    href={
                      f.title === 'AI Investigator'
                        ? '#ai-investigator'
                        : f.title === 'Role-Based Administration'
                          ? '#security'
                          : '#how-it-works'
                    }
                    style={{ fontSize: 13, fontWeight: 700, color: COLORS.linkGreen, textDecoration: 'none' }}
                  >
                    Learn more →
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section
            id="how-it-works"
            style={{
              background: COLORS.altBg,
              padding: '80px 24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <h2
                style={{
                  fontFamily: "'Manrope',sans-serif",
                  fontWeight: 800,
                  fontSize: 30,
                  margin: '0 0 44px',
                  textAlign: 'center',
                }}
              >
                How it works
              </h2>
              <div className="kuruhu-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                {STEPS.map((s) => (
                  <div key={s.n} style={{ padding: 22, borderRadius: 14, ...cardStyle }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: s.color,
                        color: '#fff',
                        fontFamily: "'Manrope',sans-serif",
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        marginBottom: 14,
                      }}
                    >
                      {s.n}
                    </div>
                    <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: '0 0 6px' }}>{s.title}</h3>
                    <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 30, margin: '0 0 10px' }}>
                A workspace that adapts to your role
              </h2>
              <p style={{ fontSize: 15, color: COLORS.textMuted, margin: '0 auto', maxWidth: 560 }}>
                Tools and actions shown depend on assigned role and permissions — illustrative examples below.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              {ROLES.map((r) => (
                <div key={r.name} style={{ padding: '16px 20px', borderRadius: 12, ...cardStyle, minWidth: 170 }}>
                  <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section
            id="ai-investigator"
            style={{
              background: COLORS.altBg,
              padding: '80px 24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="kuruhu-grid-2"
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 56,
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 30, margin: '0 0 16px' }}>
                  AI Investigator — source-linked findings, not conclusions
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: COLORS.textMuted, margin: '0 0 18px' }}>
                  Ask investigation-related questions, review structured findings with visible uncertainty, follow
                  citations to source records, and open related FIR details directly.
                </p>
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    fontSize: 13,
                    color: '#fcd34d',
                    lineHeight: 1.5,
                  }}
                >
                  AI-generated findings must be verified against source records before consequential decisions are made.
                </div>
              </div>
              <div
                style={{
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: COLORS.cardBlack,
                  padding: 18,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '10px 14px',
                      borderRadius: '10px 10px 2px 10px',
                      background: COLORS.green,
                      color: '#fff',
                      fontSize: 13,
                    }}
                  >
                    Any FIRs linked to this person in the last 6 months?
                  </div>
                </div>
                <div style={{ display: 'flex', marginBottom: 10 }}>
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 14px',
                      borderRadius: '10px 10px 10px 2px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: 13,
                      color: '#e2e8f0',
                    }}
                  >
                    Found 2 related FIRs referencing this person as a witness. Confidence: moderate.
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: 'rgba(214,173,63,0.15)',
                          color: COLORS.greenLight,
                        }}
                      >
                        FIR-2026-0142
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: 'rgba(214,173,63,0.15)',
                          color: COLORS.greenLight,
                        }}
                      >
                        FIR-2026-0187
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="dashboard-preview" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 30, margin: '0 0 10px' }}>
                The workspace you&apos;ll work in every day
              </h2>
            </div>
            <div
              className="kuruhu-grid-4"
              style={{
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                background: COLORS.cardBlack,
                padding: 16,
                boxShadow: '0 20px 50px -20px rgba(0,0,0,0.6)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4,1fr)',
                gap: 12,
              }}
            >
              {SUMMARY_CARDS.map((c) => (
                <div
                  key={c.label}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{c.label}</div>
                  <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 26 }}>{c.value}</div>
                </div>
              ))}
            </div>
          </section>

          <section
            id="security"
            style={{
              background: COLORS.altBg,
              padding: '80px 24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <h2
                style={{
                  fontFamily: "'Manrope',sans-serif",
                  fontWeight: 800,
                  fontSize: 30,
                  margin: '0 0 40px',
                  textAlign: 'center',
                }}
              >
                Security and accountability
              </h2>
              <div className="kuruhu-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
                {SECURITY_ITEMS.map((sec) => (
                  <div key={sec.title} style={{ padding: 20, borderRadius: 12, ...cardStyle }}>
                    <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: '0 0 6px' }}>{sec.title}</h3>
                    <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5, margin: 0 }}>{sec.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
            <h2
              style={{
                fontFamily: "'Manrope',sans-serif",
                fontWeight: 800,
                fontSize: 30,
                margin: '0 0 36px',
                textAlign: 'center',
              }}
            >
              Why teams choose KURUHU
            </h2>
            <div className="kuruhu-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
              {BENEFITS.map((b) => (
                <div
                  key={b}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: 16,
                    borderRadius: 12,
                    ...cardStyle,
                  }}
                >
                  <span style={{ color: COLORS.green, fontWeight: 800, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
            </div>
          </section>

          <section
            id="faq"
            style={{
              background: COLORS.altBg,
              padding: '80px 24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <h2
                style={{
                  fontFamily: "'Manrope',sans-serif",
                  fontWeight: 800,
                  fontSize: 30,
                  margin: '0 0 36px',
                  textAlign: 'center',
                }}
              >
                Frequently asked questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FAQS.map((item, i) => (
                  <div key={item.q} style={{ borderRadius: 12, ...cardStyle, overflow: 'hidden' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 18px',
                        background: 'none',
                        border: 'none',
                        color: '#f1f5f9',
                        fontWeight: 700,
                        fontSize: 14.5,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>{item.q}</span>
                      <span
                        style={{
                          transform: `rotate(${openFaq === i ? 180 : 0}deg)`,
                          transition: 'transform .2s',
                          color: '#64748b',
                        }}
                      >
                        ⌄
                      </span>
                    </button>
                    {openFaq === i && (
                      <div style={{ padding: '0 18px 16px', fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.6 }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="contact" style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 26, margin: '0 0 12px' }}>
              Need help?
            </h2>
            <p style={{ fontSize: 14.5, color: COLORS.textMuted, margin: '0 0 22px' }}>
              Our support team assists authorized users with access, workflow, and account questions.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
              <a
                href="/support"
                style={{
                  padding: '12px 22px',
                  borderRadius: 10,
                  background: COLORS.green,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                Contact Support
              </a>
            </div>
            <div style={{ display: 'flex', gap: 18, justifyContent: 'center', fontSize: 13 }}>
              <a href="/privacy" style={{ color: COLORS.linkGreen }}>
                Privacy Policy
              </a>
              <a href="/terms" style={{ color: COLORS.linkGreen }}>
                Terms &amp; Conditions
              </a>
            </div>
          </section>

          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
            <div
              className="kuruhu-final-cta"
              style={{
                borderRadius: 20,
                background: 'linear-gradient(135deg,#23063B,#712123)',
                border: '1px solid rgba(214,173,63,0.25)',
                padding: 56,
                textAlign: 'center',
              }}
            >
              <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 28, margin: '0 0 20px' }}>
                Access your investigation workspace
              </h2>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={goToLogin}
                  className="kuruhu-cta-btn"
                  style={{
                    padding: '13px 26px',
                    borderRadius: 10,
                    background: COLORS.green,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14.5,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sign In
                </button>
                <a
                  href="#contact"
                  style={{
                    padding: '13px 26px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#f1f5f9',
                    fontWeight: 700,
                    fontSize: 14.5,
                    textDecoration: 'none',
                  }}
                >
                  Contact Support
                </a>
              </div>
            </div>
          </section>

          <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '48px 24px' }}>
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 32,
              }}
            >
              <div style={{ maxWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: `linear-gradient(135deg,${COLORS.green},${COLORS.greenDark})`,
                    }}
                  />
                  <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 15 }}>KURUHU</span>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  A connected investigation and case-management workspace.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                      marginBottom: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                    }}
                  >
                    Product
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <a href="#features" style={{ fontSize: 13, color: COLORS.linkGreen }}>
                      Features
                    </a>
                    <a href="#security" style={{ fontSize: 13, color: COLORS.linkGreen }}>
                      Security
                    </a>
                    <a href="#faq" style={{ fontSize: 13, color: COLORS.linkGreen }}>
                      FAQ
                    </a>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                      marginBottom: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                    }}
                  >
                    Legal
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <a href="/privacy" style={{ fontSize: 13, color: COLORS.linkGreen }}>
                      Privacy
                    </a>
                    <a href="/terms" style={{ fontSize: 13, color: COLORS.linkGreen }}>
                      Terms
                    </a>
                    <a href="#contact" style={{ fontSize: 13, color: COLORS.linkGreen }}>
                      Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                maxWidth: 1200,
                margin: '32px auto 0',
                paddingTop: 20,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                fontSize: 12,
                color: '#475569',
              }}
            >
              © 2026 KURUHU. All rights reserved.
            </div>
          </footer>
        </div>
      )}

      {view === 'login' && (
        <div
          style={{
            minHeight: '100vh',
            background: COLORS.black,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            animation: 'kuruhuFade .4s ease',
          }}
        >
          <div style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle,rgba(214,173,63,0.16),transparent 70%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 78,
                    height: 92,
                    background: `linear-gradient(160deg,${COLORS.green},#B02B1E)`,
                    clipPath: 'polygon(50% 0%,100% 20%,100% 65%,50% 100%,0% 65%,0% 20%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px -8px rgba(214,173,63,0.6)',
                  }}
                >
                  <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 26, color: '#fff' }}>
                    K
                  </span>
                </div>
              </div>
            </div>
            <h1
              style={{
                fontFamily: "'Manrope',sans-serif",
                fontWeight: 800,
                fontSize: 32,
                margin: '0 0 28px',
                textAlign: 'center',
                color: '#fff',
              }}
            >
              KURUHU
            </h1>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, color: '#e5e7eb', marginBottom: 8 }}>Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter Mobile Number"
                style={{
                  width: '100%',
                  padding: 16,
                  borderRadius: 10,
                  background: '#e5e7eb',
                  border: `2px solid ${loginErrors.mobile ? '#f87171' : '#d1d5db'}`,
                  color: '#111827',
                  fontSize: 16,
                  outline: 'none',
                }}
              />
              {loginErrors.mobile && (
                <div style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{loginErrors.mobile}</div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, color: '#e5e7eb', marginBottom: 8 }}>Home District</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 16,
                    borderRadius: 10,
                    background: '#e5e7eb',
                    border: `2px solid ${loginErrors.district ? '#f87171' : '#d1d5db'}`,
                    color: '#111827',
                    fontSize: 16,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Please Select</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    pointerEvents: 'none',
                  }}
                >
                  ▾
                </span>
              </div>
              {loginErrors.district && (
                <div style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{loginErrors.district}</div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, color: '#e5e7eb', marginBottom: 8 }}>Language</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 16,
                    borderRadius: 10,
                    background: '#e5e7eb',
                    border: '2px solid #d1d5db',
                    color: '#111827',
                    fontSize: 16,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="en">English</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                </select>
                <span
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    pointerEvents: 'none',
                  }}
                >
                  ▾
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: 14 }}>
              <a href="/terms" style={{ fontSize: 13.5, textDecoration: 'underline', color: COLORS.linkGreen }}>
                Terms and Privacy Policy
              </a>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }}
              />
              <span style={{ fontSize: 15, color: '#e5e7eb', lineHeight: 1.4 }}>
                I agree to the Terms &amp; Privacy Policy
              </span>
            </label>
            {loginErrors.agreed && (
              <div style={{ fontSize: 12, color: '#f87171', margin: '-16px 0 16px' }}>{loginErrors.agreed}</div>
            )}

            <button
              onClick={handleLoginSubmit}
              disabled={loginLoading}
              className="kuruhu-cta-btn"
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 999,
                background: `linear-gradient(135deg,${COLORS.green},${COLORS.greenDark})`,
                color: '#fff',
                fontWeight: 700,
                fontSize: 17,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                boxShadow: '0 12px 28px -10px rgba(214,173,63,0.6)',
              }}
            >
              {loginLoading && (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#fff',
                    animation: 'kuruhuSpin .7s linear infinite',
                    display: 'inline-block',
                  }}
                />
              )}
              <span>{loginLoading ? 'Signing in…' : 'Submit'}</span>
            </button>

            <button
              onClick={() => setView('forgot')}
              style={{
                width: '100%',
                marginTop: 16,
                background: 'none',
                border: 0,
                color: COLORS.linkGreen,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Need help signing in?
            </button>

            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <a href="#hero" onClick={goToLanding} style={{ fontSize: 13, color: '#6b7280' }}>
                ← Back to homepage
              </a>
            </div>
          </div>
        </div>
      )}

      {view === 'forgot' && (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            animation: 'kuruhuFade .4s ease',
          }}
        >
          <div style={{ width: '100%', maxWidth: 420 }}>
            <div
              style={{
                borderRadius: 16,
                background: COLORS.cardBlack,
                border: '1px solid rgba(255,255,255,0.1)',
                padding: 32,
                boxShadow: '0 20px 50px -20px rgba(0,0,0,0.6)',
              }}
            >
              {forgotSubmitted ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'rgba(214,173,63,0.12)',
                      border: '1px solid rgba(214,173,63,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 18px',
                      fontSize: 22,
                      color: '#4ade80',
                    }}
                  >
                    ✓
                  </div>
                  <h1 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 19, margin: '0 0 8px' }}>
                    Check your inbox
                  </h1>
                  <p style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.6, margin: 0 }}>
                    If an account matches that address, we&apos;ve sent a link to reset your password.
                  </p>
                </div>
              ) : (
                <>
                  <h1
                    style={{
                      fontFamily: "'Manrope',sans-serif",
                      fontWeight: 800,
                      fontSize: 19,
                      margin: '0 0 6px',
                      textAlign: 'center',
                    }}
                  >
                    Reset your password
                  </h1>
                  <p style={{ fontSize: 13.5, color: COLORS.textMuted, textAlign: 'center', margin: '0 0 24px' }}>
                    Enter your email and we&apos;ll send a reset link.
                  </p>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                    Email address
                  </label>
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@department.gov"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      background: '#e5e7eb',
                      border: '2px solid #d1d5db',
                      color: '#111827',
                      fontSize: 14,
                      outline: 'none',
                      marginBottom: 20,
                    }}
                  />
                  {forgotError && (
                    <p style={{ color: '#f87171', fontSize: 12, margin: '-12px 0 16px' }}>{forgotError}</p>
                  )}
                  <button
                    onClick={() => {
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
                        setForgotError('Enter a valid email address.')
                        return
                      }
                      setForgotError('')
                      setForgotSubmitted(true)
                    }}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 10,
                      background: COLORS.green,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 14.5,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Send reset link
                  </button>
                </>
              )}
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <a href="#login" onClick={() => setView('login')} style={{ fontSize: 13, color: COLORS.linkGreen }}>
                  ← Back to login
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {false && (
        <div style={{ display: 'flex', minHeight: '100vh', animation: 'kuruhuFade .4s ease' }}>
          <aside
            className="kuruhu-dashboard-sidebar"
            style={{
              width: sidebarCollapsed ? 68 : 224,
              flexShrink: 0,
              background: COLORS.altBg,
              borderRight: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'width .18s ease',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 18,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: `linear-gradient(135deg,${COLORS.green},${COLORS.greenDark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Manrope',sans-serif",
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                K
              </div>
              {!sidebarCollapsed && (
                <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 15 }}>KURUHU</span>
              )}
            </div>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {['Dashboard', 'FIRs', 'Persons', 'AI Investigator'].map((label, i) => (
                <button
                  key={label}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 8px',
                    borderRadius: 8,
                    background: i === 0 ? 'rgba(214,173,63,0.15)' : 'rgba(255,255,255,0.04)',
                    border: 'none',
                    color: i === 0 ? COLORS.greenLight : '#cbd5e1',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: i === 0 ? COLORS.greenLight : '#cbd5e1',
                      flexShrink: 0,
                    }}
                  />
                  {!sidebarCollapsed && label}
                </button>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => setSidebarCollapsed((v) => !v)}
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {sidebarCollapsed ? '»' : '« Collapse'}
              </button>
            </div>
          </aside>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: '#000000',
              }}
            >
              <input
                className="kuruhu-dashboard-search"
                type="text"
                placeholder="Search FIRs, persons, records…"
                style={{
                  width: 320,
                  maxWidth: '40vw',
                  padding: '9px 14px',
                  borderRadius: 9,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f5f9',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                    fontSize: 12.5,
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setProfileMenuOpen((v) => !v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: COLORS.green,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {role.slice(0, 2).toUpperCase()}
                    </div>
                  </button>
                  {profileMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 38,
                        width: 180,
                        background: COLORS.cardBlack,
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                        overflow: 'hidden',
                        zIndex: 20,
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 14px',
                          fontSize: 12.5,
                          color: '#94a3b8',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {role}
                      </div>
                      <button
                        onClick={goToLanding}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 14px',
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="kuruhu-dashboard-content" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
              <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 22, margin: '0 0 4px' }}>
                  Good to see you
                </h1>
                <p style={{ fontSize: 13.5, color: COLORS.textMuted, margin: 0 }}>
                  {role} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="kuruhu-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {SUMMARY_CARDS.map((c) => (
                  <div key={c.label} style={{ padding: 18, borderRadius: 14, ...cardStyle }}>
                    <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 8 }}>{c.label}</div>
                    <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 26 }}>{c.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
