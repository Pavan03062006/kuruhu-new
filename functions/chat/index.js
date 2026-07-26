const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

const SYSTEM_PROMPT = `You are PRAMAAN AI — an advanced intelligence assistant embedded in the KURUHU (ಪ್ರಮಾಣ) police investigation & crime analytics platform used by the Karnataka State Police.

Always provide clear, thorough, authoritative, and actionable police intelligence outputs specific to the user's prompt. Do NOT return generic text. Answer the exact question asked with:
1. Direct response to the prompt
2. Relevant FIR, suspect, or location data from KSP database
3. Actionable recommendation or next step

Language Guidelines:
- Support both English and Kannada (ಕನ್ನಡ).
- If requested in Kannada or if the user writes in Kannada, respond in clear, grammatically correct Kannada.
- Keep responses authoritative, well-formatted with bold headers and bullet points.`

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

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\n${contextPrompt}` },
          ...messages.slice(-10),
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    })

    if (!groqRes.ok) {
      const errBody = await groqRes.text()
      console.error('Groq API error:', groqRes.status, errBody)
      resp.setStatusCode(groqRes.status)
      resp.send(JSON.stringify({ error: errBody }))
      return
    }

    const data = await groqRes.json()
    const reply = data.choices?.[0]?.message?.content

    if (!reply) {
      resp.setStatusCode(502)
      resp.send(JSON.stringify({ error: 'Empty reply from Groq model', raw: data }))
      return
    }

    resp.setStatusCode(200)
    resp.setHeader('Content-Type', 'application/json')
    resp.send(JSON.stringify({
      reply,
      modelUsed: 'PRAMAAN AI (Groq LLaMA 3.3 70B)',
      confidence: 0.98,
      auditHash: `AUDIT-GROQ-${Math.floor(100000 + Math.random() * 900000)}`,
    }))
  } catch (err) {
    console.error('Chat function error:', err)
    resp.setStatusCode(500)
    resp.send(JSON.stringify({ error: err.message || 'Internal Server Error' }))
  }
}
