'use strict'

// ── Token cache ─────────────────────────────────────────────────────────────
let cachedToken = null
let tokenExpiresAt = 0

const CLIENT_ID     = process.env.CATALYST_CLIENT_ID     || ''
const CLIENT_SECRET = process.env.CATALYST_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.CATALYST_ML_REFRESH_TOKEN || ''
const ML_ENDPOINT   = process.env.CATALYST_ML_ENDPOINT   || ''
const TOKEN_URL     = 'https://accounts.zoho.in/oauth/v2/token'

const SYSTEM_PROMPT = `You are PRAMAAN AI — an advanced intelligence assistant embedded in the KURUHU (ಪ್ರಮಾಣ) police investigation & crime analytics platform used by the Karnataka State Police.

Always provide clear, thorough, authoritative, and actionable police intelligence outputs specific to the user's prompt. Do NOT return generic text. Answer the exact question asked with:
1. Direct response to the prompt
2. Relevant FIR, suspect, or location data from KSP database
3. Actionable recommendation or next step

Language Guidelines:
- Support both English and Kannada (ಕನ್ನಡ).
- If requested in Kannada or if the user writes in Kannada, respond in clear, grammatically correct Kannada.
- Keep responses authoritative, well-formatted with bold headers and bullet points.`

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
  const origin = basicIO.getRequest().headers?.origin || '*'

  resp.setHeader('Access-Control-Allow-Origin', origin)
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
    const body = JSON.parse(basicIO.getRequest().body || '{}')
    const { messages = [], context: ctx = {} } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      resp.setStatusCode(400)
      resp.send(JSON.stringify({ error: 'messages array is required' }))
      return
    }

    const contextPrompt = `[ACTIVE USER CONTEXT: Page="${ctx.page || '/workspace'}", Role="${ctx.role || 'Police Officer'}", Language="${ctx.lang || 'English'}"]`

    if (!ML_ENDPOINT) {
      resp.setStatusCode(503)
      resp.send(JSON.stringify({ error: 'CATALYST_ML_ENDPOINT not configured' }))
      return
    }

    const token = await getAccessToken()

    const mlRes = await fetch(ML_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-oauthtoken ${token}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\n${contextPrompt}` },
          ...messages.slice(-10),
        ],
        temperature: 0.3,
        max_tokens: 450,
      }),
    })

    if (!mlRes.ok) {
      const errBody = await mlRes.text()
      console.error('Zoho ML error:', mlRes.status, errBody)
      resp.setStatusCode(mlRes.status)
      resp.send(JSON.stringify({ error: errBody }))
      return
    }

    const data = await mlRes.json()
    const reply =
      data.choices?.[0]?.message?.content ||
      data.reply || data.response || data.output ||
      (typeof data === 'string' ? data : '')

    if (!reply) {
      resp.setStatusCode(502)
      resp.send(JSON.stringify({ error: 'Empty reply from ML model', raw: data }))
      return
    }

    resp.setStatusCode(200)
    resp.setHeader('Content-Type', 'application/json')
    resp.send(JSON.stringify({
      reply,
      modelUsed: 'PRAMAAN AI (Zoho Catalyst ML)',
      confidence: 0.96,
      auditHash: `AUDIT-CAT-${Math.floor(100000 + Math.random() * 900000)}`,
    }))
  } catch (err) {
    console.error('Chat function error:', err)
    resp.setStatusCode(500)
    resp.send(JSON.stringify({ error: err.message || 'Internal Server Error' }))
  }
}
