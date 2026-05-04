'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PenLine, Sparkles, RefreshCw, Copy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type ToolMode = 'essay' | 'naturalness' | 'keigo' | 'translate'

const TOOLS: { value: ToolMode; label: string; emoji: string; desc: string }[] = [
  { value:'essay',      label:'作文批改',   emoji:'✍️',  desc:'批改日文作文，給分數和建議' },
  { value:'naturalness',label:'自然度檢查', emoji:'🔍',  desc:'這句日文自然嗎？' },
  { value:'keigo',      label:'敬語轉換',   emoji:'🎩',  desc:'普通體 ↔ 敬語體' },
  { value:'translate',  label:'中日翻譯',   emoji:'🌐',  desc:'中文↔日文自然翻譯' },
]

const PROMPTS: Record<ToolMode, (text: string, opt?: string) => string> = {
  essay: (t) => `請批改以下日文作文：
1. 評分（文法、詞彙、表達、整體，各25分滿分100）
2. 具體指出每個錯誤並說明原因
3. 給出修改後的版本
4. 整體學習建議

作文內容：
${t}`,

  naturalness: (t) => `請判斷以下日文是否自然，如果不自然請說明原因並給出更自然的說法：

「${t}」

請輸出：
✅/❌ 自然程度：X/10
📝 分析：說明是否自然的原因
💡 更自然的說法（如有）：`,

  keigo: (t, opt) => `請將以下日文轉換為${opt === 'to_keigo' ? '敬語（丁寧語・尊敬語）' : '普通體（口語）'}：

原文：「${t}」

請輸出轉換後的版本並說明主要變化。`,

  translate: (t, opt) => opt === 'zh_to_ja'
    ? `請將以下中文翻譯成自然的日文（同時提供口語版和書面版）：\n\n${t}`
    : `請將以下日文翻譯成自然的繁體中文，並說明重要的文法或用法：\n\n${t}`,
}

export default function WritingToolsPage() {
  const [tool,    setTool]    = useState<ToolMode>('essay')
  const [input,   setInput]   = useState('')
  const [result,  setResult]  = useState('')
  const [loading, setLoading] = useState(false)
  const [keigoDir, setKeigoDir] = useState('to_keigo')
  const [transDir, setTransDir] = useState('zh_to_ja')

  const run = async () => {
    if (!input.trim()) return
    setLoading(true); setResult('')
    const opt = tool === 'keigo' ? keigoDir : tool === 'translate' ? transDir : undefined
    const prompt = PROMPTS[tool](input, opt)

    try {
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ messages:[{ role:'user', content: prompt }] })
      })
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let accum = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of dec.decode(value).split('\n')) {
          if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
            try { accum += JSON.parse(line.slice(6)).text; setResult(accum) } catch {}
          }
        }
      }
    } catch { setResult('發生錯誤，請再試一次。') }
    setLoading(false)
  }

  const placeholder: Record<ToolMode, string> = {
    essay:       '在這裡輸入你的日文作文...',
    naturalness: '輸入一句日文，例：私は昨日学校に行きました。',
    keigo:       '輸入要轉換的句子，例：ちょっと待って。',
    translate:   transDir==='zh_to_ja' ? '輸入中文，例：我昨天去了圖書館。' : '輸入日文，例：昨日図書館に行きました。',
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>
          寫作工具
        </h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>
          作文批改・自然度檢查・敬語轉換・中日翻譯，AI 幫你精進日文 ✍️
        </p>
      </motion.div>

      {/* Tool tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {TOOLS.map(t => (
          <button key={t.value} onClick={() => { setTool(t.value); setResult('') }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-1.5 transition-all"
            style={{ border:`1.5px solid ${tool===t.value ? 'var(--accent)' : 'var(--biscuit)'}`,
                     background: tool===t.value ? 'var(--accent)' : 'var(--warm)',
                     color: tool===t.value ? '#fff' : 'var(--text-muted)' }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Direction toggles */}
      {tool === 'keigo' && (
        <div className="flex gap-2 mb-4">
          {[['to_keigo','普通體 → 敬語'],['to_casual','敬語 → 普通體']].map(([v,l]) => (
            <button key={v} onClick={() => setKeigoDir(v)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border-1.5 transition-all"
              style={{ border:`1.5px solid ${keigoDir===v ? 'var(--accent)' : 'var(--biscuit)'}`,
                       background: keigoDir===v ? 'var(--blush)' : 'var(--warm)',
                       color: keigoDir===v ? 'var(--accent)' : 'var(--text-muted)' }}>
              {l}
            </button>
          ))}
        </div>
      )}
      {tool === 'translate' && (
        <div className="flex gap-2 mb-4">
          {[['zh_to_ja','中文 → 日文'],['ja_to_zh','日文 → 中文']].map(([v,l]) => (
            <button key={v} onClick={() => setTransDir(v)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border-1.5 transition-all"
              style={{ border:`1.5px solid ${transDir===v ? 'var(--accent)' : 'var(--biscuit)'}`,
                       background: transDir===v ? 'var(--blush)' : 'var(--warm)',
                       color: transDir===v ? 'var(--accent)' : 'var(--text-muted)' }}>
              {l}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input */}
        <div className="space-y-3">
          <div className="section-label">輸入文字</div>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder={placeholder[tool]}
            className="input w-full resize-none"
            rows={tool === 'essay' ? 10 : 5}
            style={{ fontFamily:'var(--font-noto-serif)' }} />
          <div className="flex gap-2">
            <button onClick={run} disabled={loading || !input.trim()}
              className="btn-primary flex-1 justify-center">
              {loading ? <><span className="animate-spin">✨</span> 分析中...</> : <><Sparkles size={14}/> 送出分析</>}
            </button>
            <button onClick={() => { setInput(''); setResult('') }}
              className="btn-ghost px-3">
              <RefreshCw size={15}/>
            </button>
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="section-label mb-2">AI 回饋</div>
          <div className="card p-4 overflow-y-auto" style={{ minHeight: tool==='essay' ? 260 : 160, maxHeight: 400 }}>
            {!result ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <PenLine size={24} style={{ color:'var(--text-light)' }}/>
                <p className="text-xs" style={{ color:'var(--text-light)' }}>輸入文字後送出分析</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                {loading && <span className="animate-pulse">▌</span>}
              </div>
            )}
          </div>
          {result && !loading && (
            <button onClick={() => navigator.clipboard.writeText(result)}
              className="btn-secondary w-full justify-center mt-3 text-sm gap-2">
              <Copy size={13}/> 複製結果
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
