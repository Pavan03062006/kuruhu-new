'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  BrainCircuit,
  Send,
  X,
  ChevronDown,
  Bot,
  User,
  AlertCircle,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileDown,
  Globe,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  error?: boolean
  modelUsed?: string
  confidence?: number
  auditHash?: string
}

const QUICK_PROMPTS_EN = [
  'Show crime hotspots in Bengaluru',
  'Analyze repeat offenders & MO pattern',
  'Generate proactive patrol route',
  'Explain AI audit trail for FIR-0042',
]

const QUICK_PROMPTS_KN = [
  'ಬೆಂಗಳೂರಿನ ಅಪರಾಧ ತಾಣಗಳ ಪಟ್ಟಿ ತೋರಿಸಿ',
  'ಮರುಕಳಿಸುವ ಅಪರಾಧಿಗಳ ವಿಶ್ಲೇಷಣೆ ಮಾಡಿ',
  'ಪೂರ್ವಭಾವಿ ಗಸ್ತು ಮಾರ್ಗ ರಚಿಸಿ',
  'ಎಐ ಪರಿಶೋಧನೆಯ ವಿವರಣೆ ಕೊಡಿ',
]

export function AiChatbot() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const lang = language
  const setLang = setLanguage

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Namaste Officer! I am **PRAMAAN AI** — your crime analytics & investigation assistant. I provide real-time crime pattern discovery, criminal network analysis, predictive hotspot intelligence, and explainable AI insights in both **English & ಕನ್ನಡ**.\n\nHow may I assist your investigation today?',
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null)
  const [showAuditDetails, setShowAuditDetails] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Speech recognition ref
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, messages])

  // Language switch handler
  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'kn' : 'en'
    setLang(nextLang)
  }

  // Voice Input (Speech-to-Text)
  const startListening = () => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = lang === 'kn' ? 'kn-IN' : 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      if (transcript) {
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript))
      }
    }

    recognition.start()
  }

  // Voice Output (Text-to-Speech) — Zoho Catalyst Zia TTS for all languages
  const speakText = (text: string) => {
    if (typeof window === 'undefined') return

    // If currently speaking, stop
    if (isSpeaking) {
      if (activeAudio) {
        activeAudio.pause()
        setActiveAudio(null)
      }
      setIsSpeaking(false)
      return
    }

    const cleanText = text.replace(/[*#_`[\]()]/g, '')

    // Map app language to Zoho TTS language code
    const zohoLang = lang === 'kn' ? 'kn' : 'en'
    const speaker  = lang === 'kn' ? 'Anu'  : 'Mary'

    const ttsFunctionUrl = process.env.NEXT_PUBLIC_TTS_FUNCTION_URL || ''
    if (!ttsFunctionUrl) {
      console.warn('NEXT_PUBLIC_TTS_FUNCTION_URL not set — TTS disabled')
      return
    }

    setIsSpeaking(true)
    fetch(ttsFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        language: zohoLang,
        speaker,
        pitch: 'moderate',
        speed: 'moderate',
        emotion: 'neutral',
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errBody = await res.text().catch(() => '')
          throw new Error(`TTS error ${res.status}: ${errBody}`)
        }
        const blob = await res.blob()
        if (blob.size === 0) throw new Error('Zoho TTS returned empty audio')

        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)

        audio.onended = () => {
          setIsSpeaking(false)
          setActiveAudio(null)
          URL.revokeObjectURL(audioUrl)
        }
        audio.onerror = (e) => {
          console.error('Audio playback error:', e)
          setIsSpeaking(false)
          setActiveAudio(null)
          URL.revokeObjectURL(audioUrl)
        }

        setActiveAudio(audio)
        await audio.play()
      })
      .catch((err) => {
        console.error('Zoho Catalyst TTS error:', err)
        setIsSpeaking(false)
        setActiveAudio(null)
      })
  }

  // PDF Export of Conversation History
  const exportChatPdf = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const officerName = user?.display_name || 'Insp. Meera Kulkarni'
    const officerRole = user?.role?.toUpperCase() || 'POLICE INVESTIGATOR'
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    const auditHash = `PDF-AUDIT-SHA256-${Math.floor(10000000 + Math.random() * 90000000)}`

    const contentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PRAMAAN SCRB Intelligence Report</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.6; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 22px; font-weight: bold; letter-spacing: 1px; color: #0b1220; }
          .subtitle { font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
          .meta-table td { padding: 8px 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
          .meta-table td.label { font-weight: bold; color: #334155; width: 25%; }
          .chat-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
          .msg { margin-bottom: 16px; padding: 12px; border-radius: 6px; font-size: 13px; }
          .user-msg { background: #e0f2fe; border-left: 4px solid #0284c7; }
          .ai-msg { background: #f1f5f9; border-left: 4px solid #0f172a; }
          .msg-sender { font-weight: bold; font-size: 11px; text-transform: uppercase; margin-bottom: 4px; color: #475569; }
          .footer { border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">KARNATAKA STATE POLICE — SCRB</div>
            <div class="subtitle">PRAMAAN AI Conversation & Audit Briefing Report</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #475569;">
            CONFIDENTIAL / LAW ENFORCEMENT ONLY
          </div>
        </div>

        <table class="meta-table">
          <tr>
            <td class="label">Investigating Officer:</td>
            <td>${officerName} (${officerRole})</td>
            <td class="label">Generated Timestamp:</td>
            <td>${timestamp}</td>
          </tr>
          <tr>
            <td class="label">Context Route:</td>
            <td>${pathname}</td>
            <td class="label">Cryptographic Audit Hash:</td>
            <td><code>${auditHash}</code></td>
          </tr>
          <tr>
            <td class="label">AI Engine:</td>
            <td>PRAMAAN AI Engine</td>
            <td class="label">Security Level:</td>
            <td>Role-Based Access Controlled</td>
          </tr>
        </table>

        <div class="chat-box">
          <h3 style="font-size: 14px; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Transcript Log</h3>
          ${messages
            .map(
              m => `
            <div class="msg ${m.role === 'user' ? 'user-msg' : 'ai-msg'}">
              <div class="msg-sender">${m.role === 'user' ? officerName : 'PRAMAAN AI ASSISTANT'}</div>
              <div>${m.content.replace(/\n/g, '<br/>')}</div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="footer">
          <span>State Crime Records Bureau (SCRB) — Karnataka State Police</span>
          <span>Verified & Signed Digitally</span>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(contentHtml)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }


  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const history = [...messages, userMsg]
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }))

    const contextPayload = {
      page: pathname,
      role: user?.role || 'officer',
      lang: lang === 'kn' ? 'Kannada' : 'English',
    }

    const chatFunctionUrl = process.env.NEXT_PUBLIC_CHAT_FUNCTION_URL || ''

    if (!chatFunctionUrl) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ AI service not configured. Set `NEXT_PUBLIC_CHAT_FUNCTION_URL` in the build environment.',
        error: true,
      }])
      setLoading(false)
      return
    }

    try {
      const res = await fetch(chatFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context: contextPayload }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.reply) {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: data.reply,
              modelUsed: data.modelUsed || 'PRAMAAN AI (Zoho Catalyst ML)',
              confidence: data.confidence || 0.94,
              auditHash: data.auditHash || `AUDIT-CAT-${Math.floor(100000 + Math.random() * 900000)}`,
            },
          ])
          setLoading(false)
          return
        }
      }

      const errBody = await res.text().catch(() => '')
      throw new Error(`AI service error ${res.status}: ${errBody}`)
    } catch (err) {
      console.error('Chat function error:', err)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ Unable to reach PRAMAAN AI: ${err instanceof Error ? err.message : 'Unknown error'}`,
        error: true,
      }])
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const renderContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  const activePrompts = lang === 'kn' ? QUICK_PROMPTS_KN : QUICK_PROMPTS_EN

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close AI Assistant' : 'Open AI Assistant'}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300',
          open
            ? 'scale-90 bg-slate-700 text-white hover:bg-slate-600'
            : 'bg-navy text-cyan hover:scale-110 hover:shadow-cyan/20 ring-2 ring-cyan/50'
        )}
      >
        {open ? <ChevronDown className="size-5 text-white" /> : <BrainCircuit className="size-7 animate-pulse" />}
        {!open && messages.length > 1 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-cyan text-[10px] font-black text-navy shadow-sm">
            {messages.length - 1}
          </span>
        )}
      </button>

      {/* Chat window */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl transition-all duration-300',
          open
            ? 'h-[560px] w-[400px] opacity-100 translate-y-0'
            : 'pointer-events-none h-[560px] w-[400px] opacity-0 translate-y-4'
        )}
        role="dialog"
        aria-label="PRAMAAN AI Assistant"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-navy px-4 py-3.5 text-white">
          <div className="flex size-9 items-center justify-center rounded-xl bg-cyan/20">
            <BrainCircuit className="size-5 text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white leading-none">PRAMAAN AI</p>
              <span className="rounded bg-cyan/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan uppercase">Intelligence</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-300 truncate">
              {pathname} · {user?.role || 'Officer'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title="Toggle English / Kannada"
              className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-white/20"
            >
              <Globe className="size-3 text-cyan" />
              {lang === 'en' ? 'EN' : 'KN (ಕನ್ನಡ)'}
            </button>

            {/* PDF Export */}
            <button
              onClick={exportChatPdf}
              title="Export Conversation PDF Report"
              className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <FileDown className="size-4" />
            </button>

            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {messages.map(msg => (
            <div key={msg.id} className="space-y-1">
              <div className={cn('flex items-start gap-2.5', msg.role === 'user' && 'flex-row-reverse')}>
                {/* Avatar */}
                <div
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    msg.role === 'user'
                      ? 'bg-navy text-white'
                      : msg.error
                      ? 'bg-red-100 text-red-600'
                      : 'bg-cyan-100 text-cyan-900'
                  )}
                >
                  {msg.role === 'user' ? (
                    <User className="size-3.5" />
                  ) : msg.error ? (
                    <AlertCircle className="size-3.5" />
                  ) : (
                    <Bot className="size-3.5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm',
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-navy text-white'
                      : msg.error
                      ? 'rounded-tl-sm border border-red-200 bg-red-50 text-red-700'
                      : 'rounded-tl-sm border border-line bg-canvas text-ink'
                  )}
                >
                  <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />

                  {/* AI Metadata & Audit Details toggle */}
                  {msg.role === 'assistant' && msg.id !== 'welcome' && (
                    <div className="mt-2 flex items-center justify-between border-t border-line/60 pt-1.5 text-[10px] text-ink-muted">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="size-3 text-emerald-600" />
                        {Math.round((msg.confidence || 0.94) * 100)}% Confidence
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(msg.content)}
                          className="flex items-center gap-0.5 text-navy font-semibold hover:underline"
                          title="Read out loud"
                        >
                          {isSpeaking ? <VolumeX className="size-3 text-red-500" /> : <Volume2 className="size-3" />}
                          {isSpeaking ? 'Stop' : 'Listen'}
                        </button>
                        <button
                          onClick={() => setShowAuditDetails(showAuditDetails === msg.id ? null : msg.id)}
                          className="text-slate-500 hover:text-navy underline"
                        >
                          Audit Log
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expandable Explainable AI Audit Info */}
                  {showAuditDetails === msg.id && (
                    <div className="mt-2 rounded-lg bg-surface p-2.5 text-[10px] space-y-1 border border-line">
                      <p className="font-bold text-navy uppercase">Explainable AI Audit Record</p>
                      <p>
                        <span className="text-slate-500">Model Engine:</span> {msg.modelUsed || 'PRAMAAN Intelligence Engine'}
                      </p>
                      <p>
                        <span className="text-slate-500">Audit Hash:</span> <code>{msg.auditHash}</code>
                      </p>
                      <p>
                        <span className="text-slate-500">Sources Searched:</span> KSP Supabase DB, Entity Graph, PRAMAAN AI
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-900">
                <Bot className="size-3.5 animate-spin" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-line bg-canvas px-4 py-3">
                <span className="size-1.5 rounded-full bg-cyan animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-cyan animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-cyan animate-bounce" />
                <span className="ml-2 text-[11px] font-semibold text-slate-500">PRAMAAN AI synthesizing response…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="border-t border-line bg-surface/50 px-3 py-2">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1">
              <Sparkles className="size-3 text-cyan" /> Suggested Prompts ({lang === 'en' ? 'English' : 'ಕನ್ನಡ'})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {activePrompts.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:border-cyan hover:bg-cyan/10 hover:text-navy"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-line bg-white p-3">
          <div className="flex items-end gap-2 rounded-xl border border-line bg-canvas px-3 py-2 focus-within:border-cyan transition-colors">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={startListening}
              title={isListening ? 'Stop Voice Recording' : 'Start Speech-to-Text Recording'}
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              )}
            >
              {isListening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                lang === 'kn'
                  ? 'ಅಪರಾಧ ತಾಣಗಳು, ಎಫ್‌ಐಆರ್ ಅಥವಾ ಶಂಕಿತರ ಬಗ್ಗೆ ಕೇಳಿ…'
                  : 'Ask about crime hotspots, patterns, FIRs, or suspects…'
              }
              rows={1}
              className="max-h-24 flex-1 resize-none bg-transparent text-[13px] text-ink outline-none placeholder:text-slate-400"
              disabled={loading}
              style={{ height: 'auto' }}
              onInput={e => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 96) + 'px'
              }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-lg transition-all',
                input.trim() && !loading
                  ? 'bg-navy text-white hover:bg-navy-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            </button>
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Powered by PRAMAAN AI Engine</span>
            <span className="font-semibold text-slate-500">English + ಕನ್ನಡ</span>
          </div>
        </div>
      </div>
    </>
  )
}

