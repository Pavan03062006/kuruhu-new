'use client'

import { useEffect, useRef, useState } from 'react'
import { BrainCircuit, MessageSquare, Send, X, ChevronDown, Bot, User, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  error?: boolean
}

const QUICK_PROMPTS = [
  'How do I file a new FIR?',
  'What is IPC Section 379?',
  'How does evidence tracking work?',
  'Explain the AI Investigator feature',
]

export function AiChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am the **PRAMAAN AI Assistant**. I can help you with FIR management, evidence tracking, IPC sections, and anything related to this investigation platform.\n\nHow can I assist you today?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, messages])

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg]
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.error ?? 'Something went wrong. Please try again.',
            error: true,
          },
        ])
      } else {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', content: data.reply },
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Network error — please check your connection.',
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Simple markdown-like rendering (bold, newlines)
  const renderContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close AI Assistant' : 'Open AI Assistant'}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full shadow-xl transition-all duration-300',
          open
            ? 'scale-90 bg-slate-700 text-white hover:bg-slate-600'
            : 'bg-navy text-white hover:scale-110 hover:shadow-2xl'
        )}
      >
        {open ? <ChevronDown className="size-5" /> : <BrainCircuit className="size-6" />}
        {!open && messages.length > 1 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-cyan text-[9px] font-black text-navy">
            {messages.length - 1}
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl transition-all duration-300',
          open
            ? 'h-[520px] w-[380px] opacity-100 translate-y-0'
            : 'pointer-events-none h-[520px] w-[380px] opacity-0 translate-y-4'
        )}
        role="dialog"
        aria-label="PRAMAAN AI Assistant"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line bg-navy px-4 py-3.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-cyan/20">
            <BrainCircuit className="size-4 text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-none">PRAMAAN AI</p>
            <p className="mt-0.5 text-[10px] text-slate-400 uppercase tracking-wider">Investigation Assistant · Groq</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn('flex items-start gap-2.5', msg.role === 'user' && 'flex-row-reverse')}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  msg.role === 'user'
                    ? 'bg-navy text-white'
                    : msg.error
                    ? 'bg-red-100 text-red-600'
                    : 'bg-teal-100 text-teal-700'
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

              {/* Bubble */}
              <div
                className={cn(
                  'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-navy text-white'
                    : msg.error
                    ? 'rounded-tl-sm border border-red-200 bg-red-50 text-red-700'
                    : 'rounded-tl-sm border border-line bg-canvas text-ink'
                )}
                dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
              />
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <Bot className="size-3.5" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-line bg-canvas px-4 py-3">
                <span className="size-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts (only on first open) */}
        {messages.length === 1 && (
          <div className="border-t border-line px-3 py-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Quick questions</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-line bg-white p-3">
          <div className="flex items-end gap-2 rounded-xl border border-line bg-canvas px-3 py-2 focus-within:border-teal-400 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about FIRs, evidence, IPC sections…"
              rows={1}
              className="max-h-24 flex-1 resize-none bg-transparent text-[13px] text-ink outline-none placeholder:text-slate-400"
              aria-label="Chat message"
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
          <p className="mt-1.5 text-center text-[10px] text-slate-400">
            Powered by Groq · llama-3.1-8b-instant · Scoped to PRAMAAN only
          </p>
        </div>
      </div>
    </>
  )
}
