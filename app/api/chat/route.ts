import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `You are PRAMAAN AI Assistant — an intelligent assistant embedded inside the KURUHU police investigation intelligence platform used by the Karnataka State Police.

Your ONLY purpose is to assist with:
- FIR (First Information Report) related queries: how to file, track, understand, or manage FIRs
- Case investigation workflows within this application
- Evidence management, CCTV logs, physical evidence
- Person intelligence: accused, suspects, complainants, witnesses
- AI findings and case correlation features of this app
- Navigation help: "how do I...", "where can I find...", "how does X work in this app"
- Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita (BNS) sections relevant to cases
- Police investigation procedures and Karnataka State Police protocols
- Data privacy and audit trail questions about this platform
- Supabase or database-related questions from the development team

You MUST REFUSE any requests that are:
- General knowledge questions unrelated to FIR, policing, or this application
- Entertainment, jokes, creative writing, casual chat
- Coding help unrelated to this platform
- Political opinions or controversial topics
- Personal advice unrelated to the application

When refusing, be polite and redirect the user:
"I'm the PRAMAAN investigation assistant and can only help with FIR and case management topics. Please ask me something related to this application or your investigation."

Tone: Professional, concise, authoritative. You represent a law enforcement intelligence system.
Language: English by default. If the user writes in Kannada, respond in Kannada.
Format: Use bullet points or short paragraphs. Never write more than 200 words per response.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not configured in your .env file. Please add it and restart the dev server.' },
      { status: 503 }
    )
  }

  let messages: { role: 'user' | 'assistant'; content: string }[]
  try {
    const body = await req.json()
    messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) throw new Error('invalid')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const groq = new Groq({ apiKey })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10), // keep last 10 turns for context
      ],
      max_tokens: 300,
      temperature: 0.3, // lower = more focused, less creative
    })

    const reply = completion.choices[0]?.message?.content ?? 'No response generated.'
    return NextResponse.json({ reply })
  } catch (err: any) {
    const message = err?.error?.message ?? err?.message ?? 'Groq API error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
