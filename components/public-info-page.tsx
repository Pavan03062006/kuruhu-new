import Link from 'next/link'

export default function PublicInfoPage({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#D4C7C3',
        padding: '72px 24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <article
        style={{
          width: 'min(760px,100%)',
          margin: '0 auto',
          padding: '36px',
          borderRadius: 18,
          background: '#23063B',
          border: '1px solid rgba(255,255,255,.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,.25)',
        }}
      >
        <Link href="/" style={{ color: '#D6AD3F', textDecoration: 'none', fontSize: 13 }}>
          ← Back to KURUHU
        </Link>
        <p
          style={{
            margin: '36px 0 8px',
            color: '#D6AD3F',
            fontSize: 11,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          {eyebrow}
        </p>
        <h1 style={{ margin: 0, fontSize: 38, letterSpacing: '-.04em' }}>{title}</h1>
        <div style={{ marginTop: 28, color: '#D4C7C3', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
      </article>
    </main>
  )
}
