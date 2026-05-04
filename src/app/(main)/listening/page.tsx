'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Play, Pause, RotateCcw, Volume2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JLPTLevel } from '@/types'

type Stage = 'setup' | 'loading' | 'listen'

const LEVELS: JLPTLevel[] = ['N5','N4','N3','N2','N1']
const TOPICS = ['日常会話','買い物','学校・仕事','旅行','ニュース','天気','電話','レストラン']
const SPEEDS = [{ label: '遅い', rate: 0.75 }, { label: '普通', rate: 1.0 }, { label: '速い', rate: 1.25 }]

interface Script {
  title: string
  dialogue: { speaker: string; line: string; translation: string }[]
  questions: { q: string; options: string[]; answer: string; explanation: string }[]
  vocab: { word: string; reading: string; meaning: string }[]
}

export default function ListeningPage() {
  const [stage,     setStage]     = useState<Stage>('setup')
  const [level,     setLevel]     = useState<JLPTLevel>('N3')
  const [topic,     setTopic]     = useState('日常会話')
  const [script,    setScript]    = useState<Script | null>(null)
  const [showScript,setShowScript]= useState(false)
  const [showTrans, setShowTrans] = useState(false)
  const [speed,     setSpeed]     = useState(1.0)
  const [playing,   setPlaying]   = useState(false)
  const [lineIdx,   setLineIdx]   = useState(-1)
  const [answers,   setAnswers]   = useState<Record<number,string>>({})
  const [submitted, setSubmitted] = useState(false)
  const synthRef   = useRef<SpeechSynthesis | null>(null)
  const utterRef   = useRef<SpeechSynthesisUtterance | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    return () => { stopAll() }
  }, [])

  const stopAll = () => {
    synthRef.current?.cancel()
    timeoutRef.current.forEach(clearTimeout)
    timeoutRef.current = []
    setPlaying(false)
    setLineIdx(-1)
  }

  const generate = async () => {
    setStage('loading')
    setScript(null)
    setAnswers({})
    setSubmitted(false)
    setShowScript(false)
    setShowTrans(false)

    try {
      const res = await fetch('/api/listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, topic }),
      })
      const data = await res.json()
      setScript(data.script)
      setStage('listen')
    } catch {
      alert('生成失敗，請再試一次')
      setStage('setup')
    }
  }

  const playScript = () => {
    if (!script || !synthRef.current) return
    stopAll()
    setPlaying(true)

    let delay = 0
    script.dialogue.forEach((line, i) => {
      const t = setTimeout(() => {
        setLineIdx(i)
        const utt = new SpeechSynthesisUtterance(line.line)
        utt.lang = 'ja-JP'
        utt.rate = speed
        // Try to pick a Japanese voice
        const voices = synthRef.current!.getVoices()
        const jaVoice = voices.find(v => v.lang.startsWith('ja'))
        if (jaVoice) utt.voice = jaVoice
        utt.onend = () => {
          if (i === script.dialogue.length - 1) {
            setPlaying(false)
            setLineIdx(-1)
          }
        }
        utterRef.current = utt
        synthRef.current!.speak(utt)
      }, delay)
      timeoutRef.current.push(t)
      // estimate duration: roughly 3 chars/sec at normal speed
      delay += Math.max(1500, (line.line.length / speed) * 280)
    })
  }

  const score = submitted
    ? script!.questions.filter((q,i) => answers[i] === q.answer).length
    : 0

  // ── SETUP ──────────────────────────────────────────
  if (stage === 'setup') return (
    <div className="p-6 max-w-xl mx-auto">
      <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} className="mb-6">
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>AI 聽解練習</h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>
          AI 生成日文聽力腳本，瀏覽器 TTS 朗讀，配合理解測驗 🎧
        </p>
      </motion.div>

      <div className="space-y-5">
        <div>
          <div className="section-label mb-2">JLPT 等級</div>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map(lv => (
              <button key={lv} onClick={() => setLevel(lv)}
                className="px-5 py-2 rounded-full text-sm font-semibold border-1.5 transition-all"
                style={{ border:`1.5px solid ${level===lv?'var(--accent)':'var(--biscuit)'}`,
                         background:level===lv?'var(--accent)':'var(--warm)',
                         color:level===lv?'#fff':'var(--text-muted)' }}>
                {lv}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="section-label mb-2">主題</div>
          <div className="grid grid-cols-4 gap-2">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                className="px-2 py-2 rounded-xl text-xs font-medium border-1.5 transition-all text-center"
                style={{ border:`1.5px solid ${topic===t?'var(--accent)':'var(--biscuit)'}`,
                         background:topic===t?'var(--blush)':'var(--warm)',
                         color:topic===t?'var(--accent)':'var(--text-muted)' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} className="btn-primary w-full justify-center py-4">
          <Sparkles size={16}/> 生成聽力腳本
        </button>
      </div>
    </div>
  )

  // ── LOADING ────────────────────────────────────────
  if (stage === 'loading') return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-4xl animate-pulse">🎧</div>
      <div className="font-serif text-lg" style={{ color:'var(--espresso)' }}>AI 正在撰寫聽力腳本...</div>
      <div className="text-sm" style={{ color:'var(--text-muted)' }}>生成 {level} 等級「{topic}」對話中</div>
    </div>
  )

  // ── LISTEN ─────────────────────────────────────────
  if (stage === 'listen' && script) return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium" style={{ color:'var(--espresso)' }}>{script.title}</h2>
          <div className="flex gap-2 mt-1">
            <span className={cn('badge', `badge-${level.toLowerCase()}`)}>{level}</span>
            <span className="tag">{topic}</span>
          </div>
        </div>
        <button onClick={() => { stopAll(); setStage('setup') }} className="btn-ghost text-xs">← 返回</button>
      </div>

      {/* Audio controls */}
      <div className="card p-5">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={playing ? stopAll : playScript}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-105"
            style={{ background:'var(--accent)' }}>
            {playing ? <Pause size={20}/> : <Play size={20} className="ml-0.5"/>}
          </button>
          <div className="flex-1">
            <div className="text-sm font-medium mb-1" style={{ color:'var(--espresso)' }}>
              {playing ? `播放中（第 ${lineIdx+1} 句）` : '點擊播放聽力'}
            </div>
            <div className="text-xs" style={{ color:'var(--text-muted)' }}>使用瀏覽器日文語音合成</div>
          </div>
          <Volume2 size={18} style={{ color:'var(--text-light)' }}/>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color:'var(--text-muted)' }}>速度：</span>
          {SPEEDS.map(s => (
            <button key={s.rate} onClick={() => { setSpeed(s.rate); stopAll() }}
              className="px-3 py-1 rounded-lg text-xs font-medium border-1.5 transition-all"
              style={{ border:`1.5px solid ${speed===s.rate?'var(--accent)':'var(--biscuit)'}`,
                       background:speed===s.rate?'var(--blush)':'var(--warm)',
                       color:speed===s.rate?'var(--accent)':'var(--text-muted)' }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Script toggle buttons */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => setShowScript(v => !v)}
            className="btn-ghost text-xs gap-1 py-1.5 px-3">
            {showScript ? <EyeOff size={13}/> : <Eye size={13}/>}
            {showScript ? '隱藏腳本' : '顯示腳本'}
          </button>
          <button onClick={() => setShowTrans(v => !v)}
            className="btn-ghost text-xs gap-1 py-1.5 px-3">
            {showTrans ? <EyeOff size={13}/> : <Eye size={13}/>}
            {showTrans ? '隱藏翻譯' : '顯示翻譯'}
          </button>
        </div>
      </div>

      {/* Dialogue */}
      <div className="card p-5 space-y-3">
        <div className="text-sm font-semibold mb-2" style={{ color:'var(--espresso)' }}>📜 對話內容</div>
        {script.dialogue.map((line, i) => (
          <motion.div key={i}
            animate={{ background: lineIdx===i ? 'var(--blush)' : 'transparent' }}
            className="flex gap-3 p-2 rounded-xl transition-all">
            <div className="w-14 flex-shrink-0 text-xs font-bold pt-0.5"
              style={{ color:'var(--accent)' }}>
              {line.speaker}
            </div>
            <div className="flex-1">
              <div className="font-serif text-base leading-relaxed" style={{ color:'var(--espresso)', display: showScript ? 'block' : 'none' }}>
                {line.line}
              </div>
              {!showScript && (
                <div className="text-sm italic" style={{ color:'var(--text-light)' }}>（聽聽看 🎧）</div>
              )}
              {showTrans && (
                <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{line.translation}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vocab */}
      {script.vocab.length > 0 && (
        <div className="card p-5">
          <div className="text-sm font-semibold mb-3" style={{ color:'var(--espresso)' }}>📇 重要單字</div>
          <div className="grid grid-cols-2 gap-2">
            {script.vocab.map((v,i) => (
              <div key={i} className="flex gap-2 items-start p-2 rounded-lg" style={{ background:'var(--cream)' }}>
                <div>
                  <div className="font-serif font-medium text-sm" style={{ color:'var(--espresso)' }}>{v.word}</div>
                  <div className="text-xs" style={{ color:'var(--text-muted)' }}>{v.reading} · {v.meaning}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="card p-5 space-y-5">
        <div className="text-sm font-semibold" style={{ color:'var(--espresso)' }}>✏️ 理解測驗</div>
        {script.questions.map((q, qi) => (
          <div key={qi}>
            <div className="text-sm font-medium mb-2" style={{ color:'var(--espresso)' }}>
              {qi+1}. {q.q}
            </div>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === opt
                const isCorrect  = opt === q.answer
                let bg = 'var(--warm)', border = 'var(--biscuit)', color = 'var(--espresso)'
                if (submitted) {
                  if (isCorrect)                     { bg='#EAF7EA'; border='#7BC67A'; color='#2D6E2D' }
                  else if (isSelected && !isCorrect) { bg='var(--blush)'; border='var(--peach)'; color='var(--mocha)' }
                } else if (isSelected) {
                  bg='var(--blush)'; border='var(--accent)'; color='var(--espresso)'
                }
                return (
                  <button key={oi} onClick={() => !submitted && setAnswers(a => ({...a,[qi]:opt}))}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                    style={{ background:bg, border:`1.5px solid ${border}`, color }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background:'var(--biscuit)', color:'var(--text-muted)' }}>
                      {String.fromCharCode(65+oi)}
                    </span>
                    {opt}
                    {submitted && isCorrect  && <CheckCircle size={14} className="ml-auto" style={{ color:'#4CAF50' }}/>}
                    {submitted && isSelected && !isCorrect && <XCircle size={14} className="ml-auto" style={{ color:'var(--accent)' }}/>}
                  </button>
                )
              })}
            </div>
            {submitted && (
              <div className="mt-2 text-xs px-3 py-2 rounded-lg"
                style={{ background:'var(--milk)', color:'var(--text-muted)', border:'1px solid var(--biscuit)' }}>
                💡 {q.explanation}
              </div>
            )}
          </div>
        ))}

        {!submitted ? (
          <button onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < script.questions.length}
            className="btn-primary w-full justify-center">
            提交答案
          </button>
        ) : (
          <div className="text-center py-3 rounded-xl"
            style={{ background:'var(--blush)', border:'1px solid var(--peach)' }}>
            <div className="font-bold text-xl mb-1" style={{ color:'var(--espresso)' }}>
              {score} / {script.questions.length} 題正確
            </div>
            <div className="text-sm" style={{ color:'var(--text-muted)' }}>
              {score === script.questions.length ? '滿分！聽力很棒 🎉' : '繼續練習，你會進步的 ☕'}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => { stopAll(); setStage('setup') }}
        className="btn-secondary w-full justify-center gap-2">
        <RotateCcw size={14}/> 重新生成
      </button>
    </div>
  )

  return null
}
