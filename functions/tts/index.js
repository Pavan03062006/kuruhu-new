'use strict'

const http = require('http')

let cachedToken = null
let tokenExpiresAt = 0

const CLIENT_ID = process.env.CATALYST_CLIENT_ID || ''
const CLIENT_SECRET = process.env.CATALYST_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.CATALYST_TTS_REFRESH_TOKEN || ''
const ORG_ID = process.env.CATALYST_ORG || '60078981735'
const REDIRECT_URI = process.env.CATALYST_REDIRECT_URI || 'http://www.zoho.com/catalyst'
const TTS_ENDPOINT = 'https://api.catalyst.zoho.in/quickml/api/v1/models/zia/tts/synthesize'
const TOKEN_URL = 'https://accounts.zoho.in/oauth/v2/token'
const PORT = Number(process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000)

function requestOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return null

  try {
    const hostname = new URL(origin).hostname
    const configuredOrigins = (process.env.TTS_ALLOWED_ORIGINS || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    if (
      configuredOrigins.includes(origin) ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.onslate.in')
    ) {
      return origin
    }
  } catch {
    return null
  }

  return null
}

function sendJson(res, status, payload, origin) {
  const body = JSON.stringify(payload)
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  }
  if (origin) headers['Access-Control-Allow-Origin'] = origin
  res.writeHead(status, headers)
  res.end(body)
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0

    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 1_000_000) {
        reject(new Error('Request body is too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('Request body must be valid JSON'))
      }
    })
    req.on('error', reject)
  })
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25_000)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error(
      'Missing CATALYST_CLIENT_ID, CATALYST_CLIENT_SECRET, or CATALYST_TTS_REFRESH_TOKEN'
    )
  }

  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    redirect_uri: REDIRECT_URI,
  })

  const response = await fetchWithTimeout(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Zoho token refresh failed (${response.status}): ${body}`)
  }

  const data = await response.json()
  if (!data.access_token) {
    throw new Error('Zoho token refresh returned no access token')
  }

  cachedToken = data.access_token
  tokenExpiresAt = Date.now() + Number(data.expires_in || 3600) * 1_000
  return cachedToken
}

async function requestListener(req, res) {
  const origin = requestOrigin(req)

  if (req.method === 'OPTIONS') {
    const headers = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    }
    if (origin) headers['Access-Control-Allow-Origin'] = origin
    res.writeHead(204, headers)
    res.end()
    return
  }

  if (req.method === 'GET') {
    sendJson(res, 200, { status: 'ok', service: 'tts' }, origin)
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' }, origin)
    return
  }

  try {
    const body = await readJson(req)
    const text = typeof body.text === 'string' ? body.text.trim() : ''
    const language = body.language === 'kn' ? 'kn' : 'en'
    const speaker = body.speaker || (language === 'kn' ? 'Anu' : 'Mary')

    if (!text) {
      sendJson(res, 400, { error: 'text is required' }, origin)
      return
    }

    const token = await getAccessToken()
    const ttsResponse = await fetchWithTimeout(TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CATALYST-ORG': ORG_ID,
        Authorization: `Zoho-oauthtoken ${token}`,
      },
      body: JSON.stringify({
        text,
        language,
        speaker,
        speed: body.speed || 'moderate',
        pitch: body.pitch || 'moderate',
        emotion: body.emotion || 'neutral',
      }),
    })

    if (!ttsResponse.ok) {
      const errorBody = await ttsResponse.text()
      console.error('Zoho TTS error:', ttsResponse.status, errorBody)
      sendJson(res, 502, { error: 'Zoho TTS synthesis failed' }, origin)
      return
    }

    const audio = Buffer.from(await ttsResponse.arrayBuffer())
    const headers = {
      'Content-Type': ttsResponse.headers.get('content-type') || 'audio/wav',
      'Content-Length': audio.byteLength,
      'Cache-Control': 'no-store',
      Vary: 'Origin',
    }
    if (origin) headers['Access-Control-Allow-Origin'] = origin
    res.writeHead(200, headers)
    res.end(audio)
  } catch (error) {
    console.error('TTS function error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    const status = error instanceof SyntaxError || message.includes('Request body') ? 400 : 500
    sendJson(res, status, { error: message }, origin)
  }
}

http.createServer(requestListener).listen(PORT, () => {
  console.log(`TTS Advanced I/O function listening on port ${PORT}`)
})
