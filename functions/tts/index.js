'use strict'

// ── Token cache ─────────────────────────────────────────────────────────────
let cachedToken = null
let tokenExpiresAt = 0

const CLIENT_ID     = process.env.CATALYST_CLIENT_ID     || ''
const CLIENT_SECRET = process.env.CATALYST_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.CATALYST_TTS_REFRESH_TOKEN || ''
const ORG_ID        = process.env.CATALYST_ORG           || '60078981735'
const TTS_ENDPOINT  = 'https://api.catalyst.zoho.in/quickml/api/v1/models/zia/tts/synthesize'
const TOKEN_URL     = 'https://accounts.zoho.in/oauth/v2/token'

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken
  }

  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
  })

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Token refresh failed (${res.status}): ${body}`)
  }

  const data = await res.json()
  if (!data.access_token) {
    throw new Error(`No access_token in response: ${JSON.stringify(data)}`)
  }

  cachedToken    = data.access_token
  tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1_000
  return cachedToken
}

// ── Catalyst Advanced IO handler ────────────────────────────────────────────
module.exports = async (context, basicIO) => {
  const resp = basicIO.getResponse()

  // CORS headers so the Next.js static site can call this function
  resp.setHeader('Access-Control-Allow-Origin', 'https://kuruhu-new.onslate.in')
  resp.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  const method = basicIO.getRequest().method

  if (method === 'OPTIONS') {
    resp.setStatusCode(204)
    resp.send('')
    return
  }

  if (method !== 'POST') {
    resp.setStatusCode(405)
    resp.send(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  try {
    const body  = JSON.parse(basicIO.getRequest().body || '{}')
    const {
      text    = '',
      speaker = 'Anu',
      speed   = 'moderate',
      pitch   = 'moderate',
      emotion = 'neutral',
    } = body

    if (!text.trim()) {
      resp.setStatusCode(400)
      resp.send(JSON.stringify({ error: 'text is required' }))
      return
    }

    const token = await getAccessToken()

    const ttsRes = await fetch(TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CATALYST-ORG':  ORG_ID,
        'Authorization': `Zoho-oauthtoken ${token}`,
      },
      body: JSON.stringify({ text, language: 'kn', speaker, speed, pitch, emotion }),
    })

    if (!ttsRes.ok) {
      const err = await ttsRes.text()
      console.error('Zoho TTS error:', ttsRes.status, err)
      resp.setStatusCode(ttsRes.status)
      resp.send(JSON.stringify({ error: err }))
      return
    }

    const arrayBuffer = await ttsRes.arrayBuffer()
    const buffer      = Buffer.from(arrayBuffer)

    resp.setHeader('Content-Type', 'audio/wav')
    resp.setHeader('Content-Length', String(buffer.byteLength))
    resp.setHeader('Cache-Control', 'no-store')
    resp.setStatusCode(200)
    resp.send(buffer)
  } catch (err) {
    console.error('TTS function error:', err)
    resp.setStatusCode(500)
    resp.send(JSON.stringify({ error: err.message || 'Internal Server Error' }))
  }
}
