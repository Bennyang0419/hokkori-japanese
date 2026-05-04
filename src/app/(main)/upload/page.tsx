'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image, Sparkles, BookOpen, List, HelpCircle, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Mode = 'idle' | 'uploading' | 'analyzing' | 'done'
type OutputType = 'summary' | 'vocab' | 'grammar' | 'quiz'

const OUTPUT_TYPES: { value: OutputType; label: string; emoji: string; desc: string }[] = [
  { value:'summary', label:'重點整理',  emoji:'📋', desc:'整理關鍵文法和單字' },
  { value:'vocab',   label:'單字列表',  emoji:'📇', desc:'提取所有重要詞彙' },
  { value:'grammar', label:'文法分析',  emoji:'📖', desc:'分析使用的文法句型' },
  { value:'quiz',    label:'自動出題',  emoji:'✏️', desc:'根據內容生成練習題' },
]

export default function UploadPage() {
  const [mode, setMode]             = useState<Mode>('idle')
  const [file, setFile]             = useState<File | null>(null)
  const [text, setText]             = useState('')
  const [outputType, setOutputType] = useState<OutputType>('summary')
  const [result, setResult]         = useState('')
  const [streaming, setStreaming]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setMode('uploading')
    // Read text files directly; PDFs/images via API
    if (f.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = e => { setText(e.target?.result as string || ''); setMode('idle') }
      reader.readAsText(f)
    } else {
      setMode('idle') // Will send to API for OCR
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const analyze = async () => {
    if (!file && !text.trim()) return
    setMode('analyzing')
    setResult('')
    setStreaming(true)

    const formData = new FormData()
    if (file) formData.append('file', file)
    formData.append('text', text)
    formData.append('outputType', outputType)

    try {
      const res = await fetch('/api/upload', { method:'POST', body: formData })
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
            try { accum += JSON.parse(data).text; setResult(accum) } catch {}
          }
        }
      }
      setMode('done')
    } catch {
      setResult('分析失敗，請再試一次。')
      setMode('idle')
    }
    setStreaming(false)
  }

  const reset = () => {
    setFile(null); setText(''); setResult(''); setMode('idle')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>
          筆記 AI 分析
        </h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>
          上傳 PDF、圖片、Word 或手寫筆記，AI 幫你整理重點、分析文法、自動出題 ✨
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-4">
          {/* Drop zone */}
          <div ref={dropRef}
            onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
            style={{ borderColor: file ? 'var(--accent)' : 'var(--biscuit)',
                     background: file ? 'var(--blush)' : 'var(--warm)' }}>
            <input ref={fileRef} type="file" className="hidden"
              accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.webp"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {file ? (
              <>
                <div className="text-2xl mb-2">
                  {file.type.includes('image') ? '🖼️' : file.type.includes('pdf') ? '📄' : '📝'}
                </div>
                <div className="text-sm font-medium" style={{ color:'var(--espresso)' }}>{file.name}</div>
                <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>
                  {(file.size / 1024).toFixed(0)} KB
                </div>
                <button onClick={e => { e.stopPropagation(); reset() }}
                  className="text-xs mt-2 px-3 py-1 rounded-full"
                  style={{ color:'var(--accent)', background:'var(--blush)' }}>
                  移除
                </button>
              </>
            ) : (
              <>
                <Upload size={24} className="mx-auto mb-3" style={{ color:'var(--text-light)' }}/>
                <div className="text-sm font-medium" style={{ color:'var(--espresso)' }}>
                  拖放檔案或點擊上傳
                </div>
                <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>
                  PDF · Word · TXT · JPG · PNG
                </div>
              </>
            )}
          </div>

          {/* Or paste text */}
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color:'var(--text-muted)' }}>
              或直接貼上日文文字
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="貼上日文文章、筆記、作文..."
              className="input resize-none w-full"
              rows={5}
              style={{ fontFamily:'var(--font-noto-serif)' }} />
          </div>

          {/* Output type */}
          <div>
            <div className="section-label mb-2">分析類型</div>
            <div className="grid grid-cols-2 gap-2">
              {OUTPUT_TYPES.map(t => (
                <button key={t.value} onClick={() => setOutputType(t.value)}
                  className={cn('p-3 rounded-xl border text-left transition-all text-sm',
                    outputType===t.value ? 'ring-2 ring-[var(--accent)]' : '')}
                  style={{ border:`1.5px solid ${outputType===t.value ? 'var(--accent)' : 'var(--biscuit)'}`,
                           background: outputType===t.value ? 'var(--blush)' : 'var(--warm)' }}>
                  <span className="mr-1">{t.emoji}</span>
                  <span className="font-medium" style={{ color:'var(--espresso)' }}>{t.label}</span>
                  <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={analyze}
            disabled={(!file && !text.trim()) || mode === 'analyzing'}
            className="btn-primary w-full justify-center">
            {mode === 'analyzing'
              ? <><span className="animate-spin">✨</span> AI 分析中...</>
              : <><Sparkles size={15}/> 開始 AI 分析</>}
          </button>
        </div>

        {/* Right: Result */}
        <div>
          <div className="section-label mb-2">分析結果</div>
          <div className="card p-4 min-h-[400px] overflow-y-auto"
            style={{ maxHeight: 520 }}>
            {!result && mode !== 'analyzing' ? (
              <div className="flex flex-col items-center justify-center h-60 gap-3">
                <Sparkles size={28} style={{ color:'var(--text-light)' }}/>
                <p className="text-sm text-center" style={{ color:'var(--text-light)' }}>
                  上傳檔案或貼上文字<br/>AI 會幫你分析整理
                </p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none"
                style={{ '--tw-prose-body':'var(--text-muted)',
                         '--tw-prose-headings':'var(--espresso)' } as React.CSSProperties}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result || '...'}</ReactMarkdown>
                {streaming && <span className="animate-pulse">▌</span>}
              </div>
            )}
          </div>
          {result && (
            <button onClick={() => navigator.clipboard.writeText(result)}
              className="btn-secondary w-full justify-center mt-3 text-sm gap-2">
              <Download size={14}/> 複製結果
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// tiny cn helper inline (safe duplicate)
function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ')
}
