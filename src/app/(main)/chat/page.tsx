'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Plus, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message { role: 'user' | 'assistant'; content: string }

const QUICK_PROMPTS = [
  '「〜ている」和「〜てある」有什麼差？',
  '幫我出 5 道 N3 文法選擇題',
  '這句自然嗎？「私は昨日映画を見に行きました」',
  '幫我整理 N4 常見敬語',
  '「は」和「が」的差別？',
]

export default function ChatPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `こんにちは！私は ほっこり AI 助教です ☕\n\n文法・翻譯・作文批改・練習題⋯ 什麼都可以問我！今天想學什麼呢？` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const createSession = async () => {
    if (!profile || sessionId) return
    const { data } = await supabase
      .from('chat_sessions')
      .insert({ user_id: profile.id, title: '新對話' })
      .select().single()
    setSessionId(data?.id ?? null)
    return data?.id
  }

  const send = async (text?: string) => {
    const content = text ?? input.trim()
    if (!content || loading) return
    setInput('')

    const sid = sessionId ?? await createSession()
    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)

    // Add streaming placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          sessionId: sid,
        }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accum = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const { text } = JSON.parse(data)
              accum += text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: accum }
                return updated
              })
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: '抱歉，發生了一點錯誤。請再試一次 ☕' }
        return updated
      })
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'var(--warm)', borderColor: 'var(--biscuit)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, var(--peach), var(--caramel))' }}>
            🍵
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--espresso)' }}>ほっこり AI 助教</div>
            <div className="text-xs flex items-center gap-1" style={{ color: '#4CAF50' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span> 在線中
            </div>
          </div>
        </div>
        <button onClick={() => { setMessages([{ role: 'assistant', content: 'こんにちは！新對話開始了，有什麼想學的嗎？ ☕' }]); setSessionId(null) }}
          className="btn-ghost text-xs gap-1">
          <Plus size={14} /> 新對話
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick prompts (shown when only 1 message) */}
        {messages.length === 1 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-2">
            <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>
              💡 快速提問
            </p>
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => send(p)}
                className="w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-all hover:bg-[var(--blush)]"
                style={{ borderColor: 'var(--biscuit)', background: 'var(--warm)', color: 'var(--text-muted)' }}>
                {p}
              </button>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
                  style={{ background: 'var(--blush)' }}>🍵</div>
              )}
              <div className={msg.role === 'assistant' ? 'chat-bubble-ai prose prose-sm max-w-none' : 'chat-bubble-user'}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || '⋯'}</ReactMarkdown>
                ) : msg.content}
                {msg.role === 'assistant' && loading && i === messages.length - 1 && msg.content === '' && (
                  <span className="animate-pulse">▌</span>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                  style={{ background: 'var(--blush)', color: 'var(--accent)' }}>
                  {profile?.display_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--biscuit)', background: 'var(--warm)' }}>
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="問問看... 文法、翻譯、作文批改 🍵"
            rows={1}
            className="input flex-1 resize-none py-3 leading-relaxed"
            style={{ minHeight: 44, maxHeight: 120 }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="btn-primary px-4 py-3 rounded-xl"
            style={{ opacity: (!input.trim() || loading) ? 0.5 : 1 }}>
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-light)' }}>
          <Sparkles size={10} className="inline mr-1" />
          Powered by Claude · 支援文法解說、翻譯、作文批改、AI 出題
        </p>
      </div>
    </div>
  )
}
