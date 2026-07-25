import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      text = '',
      speaker = 'Anu',
      speed = 'moderate',
      pitch = 'moderate',
      emotion = 'neutral',
    } = body

    if (!text) {
      return NextResponse.json({ error: 'Text is required in request body' }, { status: 400 })
    }

    return handleSynthesize({ text, speaker, speed, pitch, emotion })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

async function handleSynthesize({
  text,
  speaker,
  speed,
  pitch,
  emotion,
}: {
  text: string
  speaker: string
  speed: string
  pitch: string
  emotion: string
}) {
  const endpoint =
    process.env.CATALYST_TTS_ENDPOINT ||
    'https://api.catalyst.zoho.in/quickml/api/v1/models/zia/tts/synthesize'
  const orgId = process.env.CATALYST_ORG || '60078981735'
  const token = process.env.CATALYST_TTS_TOKEN || ''

  if (!token) {
    console.warn('CATALYST_TTS_TOKEN is not configured. Falling back to empty audio.')
    return new Response(Buffer.from([]), {
      status: 200,
      headers: { 'Content-Type': 'audio/wav' },
    })
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CATALYST-ORG': orgId,
        'Authorization': `Zoho-oauthtoken ${token}`,
      },
      body: JSON.stringify({
        text,
        language: 'kn',
        speaker,
        speed,
        pitch,
        emotion,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Zoho Catalyst TTS synthesis API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Failed to synthesize speech from Zoho Catalyst: ${errorText}` },
        { status: response.status }
      )
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Error in Zoho Catalyst TTS handler:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
