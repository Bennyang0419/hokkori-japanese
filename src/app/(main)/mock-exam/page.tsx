'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trophy, RotateCcw, Sparkles, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JLPTLevel, QuizQuestion } from '@/types'

type Stage = 'setup' | 'loading' | 'exam' | 'result'

const EXAM_CONFIG: Record<JLPTLevel, { sections: string[]; counts: number[]; timeMin: number }> = {
  N5: { sections:['文字・語彙','文法','讀解'], counts:[15,10,5],  timeMin:25 },
  N4: { sections:['文字・語彙','文法','讀解'], counts:[20,15,8],  timeMin:35 },
  N3: { sections:['文字・語彙','文法','讀解'], counts:[22,18,12], timeMin:50 },
  N2: { sections:['文字・語彙','文法','讀解'], counts:[25,20,15], timeMin:55 },
  N1: { sections:['文字・語彙','文法','讀解'], counts:[25,20,15], timeMin:60 },
}

export default function MockExamPage() {
  const [stage,     setStage]     = useState<Stage>('setup')
  const [level,     setLevel]     = useState<JLPTLevel>('N3')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers,   setAnswers]   = useState<Record<number, string>>({})
  const [timeLeft,  setTimeLeft]  = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [results,   setResults]   = useState<{ score:number; correct:number; total:number } | null>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  const cfg = EXAM_CONFIG[level]
  const totalQ = cfg.counts.reduce((a,b) => a+b, 0)

  // Timer
  useEffect(() => {
    if (stage !== 'exam') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); submitExam(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [stage])

  const startExam = async () => {
    setStage('loading')
    try {
      // Generate all questions in parallel sections
      const allQuestions: QuizQuestion[] = []
      let sid = ''
      for (const sec of cfg.sections) {
        const type = sec.includes('語彙') ? 'multiple_choice'
                   : sec.includes('文法') ? 'multiple_choice'
                   : 'reading_comp'
        const cnt = cfg.counts[cfg.sections.indexOf(sec)]
        const res = await fetch('/api/quiz', {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ level, type, count: cnt, focus: sec })
        })
        const data = await res.json()
        allQuestions.push(...(data.questions ?? []))
        if (!sid) sid = data.sessionId
      }
      setQuestions(allQuestions)
      setSessionId(sid)
      setAnswers({})
      setTimeLeft(cfg.timeMin * 60)
      setStage('exam')
    } catch {
      alert('模擬考出題失敗，請再試一次')
      setStage('setup')
    }
  }

  const submitExam = async () => {
    clearInterval(timerRef.current)
    const answerList = questions.map((q, i) => ({
      question: q,
      userAnswer: answers[i] ?? '',
      isCorrect: answers[i] === q.correct_answer,
      timeSec: 0,
    }))
    const res = await fetch('/api/quiz/submit', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ sessionId, answers: answerList })
    })
    const data = await res.json()
    setResults(data)
    setStage('result')
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2,'0')
  const ss = String(timeLeft % 60).padStart(2,'0')
  const answered = Object.keys(answers).length
  const pct = questions.length ? Math.round((answered / questions.length) * 100) : 0

  // ─── SETUP ────────────────────────────────────────
  if (stage === 'setup') return (
    <div className="p-6 max-w-xl mx-auto">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>
          JLPT 模擬考
        </h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>
          完整仿真考試環境，計時作答，成績分析 📋
        </p>
      </motion.div>

      <div className="section-label mb-3">選擇考試等級</div>
      <div className="grid grid-cols-5 gap-2 mb-6">
        {(['N5','N4','N3','N2','N1'] as JLPTLevel[]).map(lv => (
          <button key={lv} onClick={() => setLevel(lv)}
            className="py-3 rounded-xl text-sm font-bold border-1.5 transition-all"
            style={{ border:`1.5px solid ${level===lv ? 'var(--accent)' : 'var(--biscuit)'}`,
                     background: level===lv ? 'var(--accent)' : 'var(--warm)',
                     color: level===lv ? '#fff' : 'var(--text-muted)' }}>
            {lv}
          </button>
        ))}
      </div>

      {/* Exam info */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="text-sm font-semibold" style={{ color:'var(--espresso)' }}>
          {level} 模擬考資訊
        </div>
        {cfg.sections.map((sec, i) => (
          <div key={sec} className="flex items-center justify-between text-sm">
            <span style={{ color:'var(--text-muted)' }}>{sec}</span>
            <span className="font-medium" style={{ color:'var(--espresso)' }}>{cfg.counts[i]} 題</span>
          </div>
        ))}
        <div className="border-t pt-3 flex justify-between text-sm font-semibold"
          style={{ borderColor:'var(--biscuit)' }}>
          <span style={{ color:'var(--text-muted)' }}>總題數 / 時間</span>
          <span style={{ color:'var(--acc)' }}>{totalQ} 題 / {cfg.timeMin} 分鐘</span>
        </div>
      </div>

      <div className="card p-3 mb-5 flex gap-2 text-sm"
        style={{ background:'#FEF7E0', borderColor:'#FAC775' }}>
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color:'#8B6D1F' }}/>
        <span style={{ color:'#8B6D1F' }}>考試開始後計時不能暫停，時間到自動提交。</span>
      </div>

      <button onClick={startExam} className="btn-primary w-full justify-center text-base py-4">
        <Sparkles size={16}/> 開始模擬考
      </button>
    </div>
  )

  // ─── LOADING ──────────────────────────────────────
  if (stage === 'loading') return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-4xl animate-bounce">📋</div>
      <div className="font-serif text-lg" style={{ color:'var(--espresso)' }}>AI 正在出題中...</div>
      <div className="text-sm" style={{ color:'var(--text-muted)' }}>
        生成 {totalQ} 道 {level} 考試題目，請稍候
      </div>
    </div>
  )

  // ─── EXAM ─────────────────────────────────────────
  if (stage === 'exam') return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 px-6 py-3 border-b flex items-center justify-between"
        style={{ background:'var(--warm)', borderColor:'var(--biscuit)' }}>
        <div className="flex items-center gap-2">
          <span className={cn('badge', `badge-${level.toLowerCase()}`)}>{level}</span>
          <span className="text-sm" style={{ color:'var(--text-muted)' }}>
            已答 {answered}/{questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono font-bold text-lg"
          style={{ color: timeLeft < 300 ? 'var(--accent)' : 'var(--espresso)' }}>
          <Clock size={18}/> {mm}:{ss}
        </div>
        <button onClick={submitExam}
          className="btn-primary text-sm px-4 py-2">
          交卷
        </button>
      </div>

      {/* Answer grid + questions */}
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        {/* Answer sheet quick nav */}
        <div className="card p-3 mb-5">
          <div className="text-xs font-semibold mb-2" style={{ color:'var(--text-muted)' }}>答案卡</div>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((_, i) => (
              <button key={i}
                onClick={() => document.getElementById(`q-${i}`)?.scrollIntoView({ behavior:'smooth' })}
                className="w-7 h-7 rounded-md text-xs font-medium transition-all"
                style={{ background: answers[i] ? 'var(--accent)' : 'var(--biscuit)',
                         color: answers[i] ? '#fff' : 'var(--text-muted)' }}>
                {i+1}
              </button>
            ))}
          </div>
          <div className="progress-track mt-2">
            <div className="progress-fill" style={{ width:`${pct}%` }}/>
          </div>
        </div>

        {/* Questions */}
        {questions.map((q, i) => (
          <div key={i} id={`q-${i}`} className="card p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                style={{ background:'var(--biscuit)', color:'var(--text-muted)' }}>
                第 {i+1} 題
              </span>
            </div>
            <div className="font-serif text-base leading-loose mb-4" style={{ color:'var(--espresso)' }}>
              {q.question}
            </div>
            <div className="space-y-2">
              {q.options?.map((opt, j) => (
                <button key={j} onClick={() => setAnswers(prev => ({ ...prev, [i]: opt }))}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-1.5 text-sm text-left transition-all"
                  style={{ border:`1.5px solid ${answers[i]===opt ? 'var(--accent)' : 'var(--biscuit)'}`,
                           background: answers[i]===opt ? 'var(--blush)' : 'var(--warm)',
                           color:'var(--espresso)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: answers[i]===opt ? 'var(--accent)' : 'var(--biscuit)',
                             color: answers[i]===opt ? '#fff' : 'var(--text-muted)' }}>
                    {String.fromCharCode(65+j)}
                  </div>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button onClick={submitExam} className="btn-primary w-full justify-center py-4 text-base mb-6">
          交卷並查看成績
        </button>
      </div>
    </div>
  )

  // ─── RESULT ───────────────────────────────────────
  if (stage === 'result' && results) {
    const pass = results.score >= 60
    return (
      <div className="p-6 max-w-xl mx-auto">
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          className="card p-8 text-center mb-6">
          <div className="text-5xl mb-3">{pass ? '🎉' : '☕'}</div>
          <h2 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>
            {level} 模擬考完成
          </h2>
          <div className="text-4xl font-bold mt-3 mb-1"
            style={{ color: pass ? '#4CAF50' : 'var(--accent)' }}>
            {results.score}<span className="text-xl">分</span>
          </div>
          <div className="text-sm mb-4" style={{ color:'var(--text-muted)' }}>
            {pass ? '達到及格標準，繼續保持！' : '加油！距離及格還有一段距離，多練習吧 ☕'}
          </div>
          <div className="flex justify-center gap-8">
            <div><div className="text-xl font-bold" style={{ color:'#4CAF50' }}>{results.correct}</div><div className="text-xs" style={{ color:'var(--text-muted)' }}>答對</div></div>
            <div><div className="text-xl font-bold" style={{ color:'var(--accent)' }}>{results.total - results.correct}</div><div className="text-xs" style={{ color:'var(--text-muted)' }}>答錯</div></div>
            <div><div className="text-xl font-bold" style={{ color:'var(--espresso)' }}>{results.total}</div><div className="text-xs" style={{ color:'var(--text-muted)' }}>總題數</div></div>
          </div>
        </motion.div>
        <div className="flex gap-3">
          <button onClick={() => setStage('setup')} className="btn-secondary flex-1 justify-center gap-2">
            <RotateCcw size={14}/> 再考一次
          </button>
          <a href="/mistakes" className="btn-primary flex-1 justify-center gap-2">
            查看錯題
          </a>
        </div>
      </div>
    )
  }

  return null
}
