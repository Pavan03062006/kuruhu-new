import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── In-memory token cache ──────────────────────────────────────────────────
let cachedToken: string | null = null
let tokenExpiresAt = 0 // Unix ms

const CLIENT_ID     = process.env.CATALYST_CLIENT_ID     || ''
const CLIENT_SECRET = process.env.CATALYST_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.CATALYST_TTS_REFRESH_TOKEN || ''
const ORG_ID        = process.env.CATALYST_ORG           || '60078981735'
const REDIRECT_URI  = process.env.CATALYST_REDIRECT_URI  || 'http://www.zoho.com/catalyst'
const TTS_ENDPOINT  = 'https://api.catalyst.zoho.in/quickml/api/v1/models/zia/tts/synthesize'
const TOKEN_URL     = 'https://accounts.zoho.in/oauth/v2/token'

async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error(
      'TTS is not configured. Set CATALYST_CLIENT_ID, CATALYST_CLIENT_SECRET, and CATALYST_TTS_REFRESH_TOKEN.'
    )
  }

  // Return cached token if still valid (with 60 s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken
  }

  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    redirect_uri:  REDIRECT_URI,
  })

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Zoho token refresh failed (${res.status}): ${body}`)
  }

  const data = await res.json()

  if (!data.access_token) {
    throw new Error(`Zoho token refresh returned no access_token: ${JSON.stringify(data)}`)
  }

  cachedToken    = data.access_token as string
  // expires_in is in seconds; default to 3600 if absent
  tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1_000

  return cachedToken
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      text    = '',
      language = 'en',
      speaker = language === 'kn' ? 'Anu' : 'Mary',
      speed   = 'moderate',
      pitch   = 'moderate',
      emotion = 'neutral',
    } = body

    if (!text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const token = await getAccessToken()

    const ttsRes = await fetch(TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CATALYST-ORG':  ORG_ID,
        'Authorization': `Zoho-oauthtoken ${token}`,
      },
      body: JSON.stringify({
        text,
        language,
        speaker,
        speed,
        pitch,
        emotion,
      }),
    })

    if (!ttsRes.ok) {
      const errBody = await ttsRes.text()
      console.error('Zoho TTS error:', ttsRes.status, errBody)
      return NextResponse.json(
        { error: `Zoho TTS API error (${ttsRes.status}): ${errBody}` },
        { status: ttsRes.status }
      )
    }

    const arrayBuffer = await ttsRes.arrayBuffer()
    const buffer      = Buffer.from(arrayBuffer)
    const contentType = ttsRes.headers.get('content-type') || 'audio/wav'

    return new Response(buffer, {
      headers: {
        'Content-Type':   contentType,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control':  'no-store',
      },
    })
  } catch (err) {
    console.error('TTS route error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
