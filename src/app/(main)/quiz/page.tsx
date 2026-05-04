'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Clock, CheckCircle, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JLPTLevel, QuizType, QuizQuestion } from '@/types'

type Screen = 'setup' | 'quiz' | 'result'

const LEVELS: JLPTLevel[] = ['N5','N4','N3','N2','N1']
const QUIZ_TYPES: { value: QuizType; label: string; emoji: string; desc: string }[] = [
  { value: 'multiple_choice', label: '文法選擇', emoji: '📖', desc: '四選一文法填空' },
  { value: 'fill_blank',      label: '單字填空', emoji: '✏️', desc: '填入正確單字' },
  { value: 'reading_comp',    label: '閱讀理解', emoji: '📄', desc: '短文閱讀測驗' },
  { value: 'sort',            label: '句子排序', emoji: '🔀', desc: '重組日文句子' },
]
const COUNTS = [5, 10, 15, 20]

interface Answer { question: QuizQuestion; userAnswer: string; isCorrect: boolean; timeSec: number }

export default function QuizPage() {
  const [screen, setScreen]         = useState<Screen>('setup')
  const [level, setLevel]           = useState<JLPTLevel>('N3')
  const [quizType, setQuizType]     = useState<QuizType>('multiple_choice')
  const [count, setCount]           = useState(10)
  const [fromMistakes, setFromMistakes] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [questions, setQuestions]   = useState<QuizQuestion[]>([])
  const [sessionId, setSessionId]   = useState('')
  const [qIdx, setQIdx]             = useState(0)
  const [selected, setSelected]     = useState<string | null>(null)
  const [answered, setAnswered]     = useState(false)
  const [answers, setAnswers]       = useState<Answer[]>([])
  const [startTime, setStartTime]   = useState(0)
  const [reviewIdx, setReviewIdx]   = useState<number | null>(null)

  // ── Setup → Generate ──────────────────────────────
  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, type: quizType, count, fromMistakes }),
      })
      const data = await res.json()
      setQuestions(data.questions)
      setSessionId(data.sessionId)
      setQIdx(0); setAnswers([]); setSelected(null); setAnswered(false)
      setStartTime(Date.now())
      setScreen('quiz')
    } catch {
      alert('出題失敗，請再試一次')
    }
    setLoading(false)
  }

  // ── Answer ─────────────────────────────────────────
  const handleAnswer = (opt: string) => {
    if (answered) return
    setSelected(opt)
    setAnswered(true)
    const q = questions[qIdx]
    const isCorrect = opt === q.correct_answer
    const timeSec = Math.round((Date.now() - startTime) / 1000)
    setAnswers(prev => [...prev, { question: q, userAnswer: opt, isCorrect, timeSec }])
  }

  const next = async () => {
    if (qIdx + 1 >= questions.length) {
      // Submit
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: [...answers] }),
      })
      setScreen('result')
    } else {
      setQIdx(i => i + 1)
      setSelected(null)
      setAnswered(false)
      setStartTime(Date.now())
    }
  }

  const score = Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100) || 0
  const q = questions[qIdx]

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETUP SCREEN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (screen === 'setup') return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>
          AI 智慧出題
        </h1>
        <p className="text-sm mb-6" style={{ color:'var(--text-muted)' }}>
          選好設定，AI 幫你生成個人化練習題 ✨
        </p>
      </motion.div>

      {/* Level */}
      <div className="mb-5">
        <div className="section-label mb-2">JLPT 等級</div>
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map(lv => (
            <button key={lv} onClick={() => setLevel(lv)}
              className={cn('px-5 py-2 rounded-full text-sm font-semibold border-1.5 transition-all',
                level===lv ? 'text-white border-transparent' : 'border-[var(--biscuit)]')}
              style={level===lv
                ? { background:'var(--accent)' }
                : { background:'var(--warm)', color:'var(--text-muted)' }}>
              {lv}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="mb-5">
        <div className="section-label mb-2">題目類型</div>
        <div className="grid grid-cols-2 gap-3">
          {QUIZ_TYPES.map(t => (
            <button key={t.value} onClick={() => setQuizType(t.value)}
              className={cn('card p-3 text-left transition-all',
                quizType===t.value ? 'ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--milk)]')}>
              <div className="flex items-center gap-2 mb-1">
                <span>{t.emoji}</span>
                <span className="font-semibold text-sm" style={{ color:'var(--espresso)' }}>{t.label}</span>
              </div>
              <div className="text-xs" style={{ color:'var(--text-muted)' }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="mb-5">
        <div className="section-label mb-2">題目數量</div>
        <div className="flex gap-2">
          {COUNTS.map(c => (
            <button key={c} onClick={() => setCount(c)}
              className={cn('w-14 py-2 rounded-xl text-sm font-semibold border-1.5 transition-all',
                count===c ? 'text-white border-transparent' : 'border-[var(--biscuit)]')}
              style={count===c
                ? { background:'var(--accent)' }
                : { background:'var(--warm)', color:'var(--text-muted)' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* From mistakes toggle */}
      <div className="mb-6">
        <button onClick={() => setFromMistakes(v => !v)}
          className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border-1.5 w-full text-left transition-all',
            fromMistakes ? 'border-[var(--accent)]' : 'border-[var(--biscuit)]')}
          style={{ background: fromMistakes ? 'var(--blush)' : 'var(--warm)' }}>
          <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
            fromMistakes ? 'border-[var(--accent)]' : 'border-[var(--biscuit)]')}
            style={fromMistakes ? { background:'var(--accent)' } : {}}>
            {fromMistakes && <span className="text-white text-xs">✓</span>}
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color:'var(--espresso)' }}>根據錯題本出題</div>
            <div className="text-xs" style={{ color:'var(--text-muted)' }}>專攻你的弱點，加速進步</div>
          </div>
        </button>
      </div>

      <button onClick={generate} disabled={loading}
        className="btn-primary w-full justify-center text-base py-4">
        {loading
          ? <><span className="animate-spin">✨</span> AI 正在出題中...</>
          : <><Sparkles size={16}/> 開始 {count} 題練習</>}
      </button>
    </div>
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUIZ SCREEN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (screen === 'quiz' && q) return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Meta bar */}
      <div className="flex items-center justify-between mb-3">
        <span className={cn('badge', `badge-${level.toLowerCase()}`)}>{level}</span>
        <span className="text-sm font-medium" style={{ color:'var(--text-muted)' }}>
          {qIdx+1} / {questions.length}
        </span>
        <button onClick={() => setScreen('setup')} className="text-xs btn-ghost py-1 px-3">
          ✕ 離開
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-track mb-6">
        <motion.div className="progress-fill"
          animate={{ width:`${((qIdx) / questions.length)*100}%` }}
          transition={{ duration:0.4 }} />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={qIdx}
          initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
          transition={{ duration:0.22 }}>

          <div className="card p-6 mb-4">
            <div className="text-xs font-semibold mb-3" style={{ color:'var(--text-muted)' }}>
              問題 {qIdx+1}
            </div>
            <div className="font-serif text-xl leading-relaxed" style={{ color:'var(--espresso)' }}>
              {q.question}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options?.map((opt, i) => {
              const isCorrect = opt === q.correct_answer
              const isSelected = opt === selected
              let style: React.CSSProperties = { background:'var(--warm)', borderColor:'var(--biscuit)', color:'var(--espresso)' }
              if (answered) {
                if (isCorrect) style = { background:'#EAF7EA', borderColor:'#7BC67A', color:'#2D6E2D' }
                else if (isSelected) style = { background:'var(--blush)', borderColor:'var(--peach)', color:'var(--mocha)' }
              } else if (isSelected) {
                style = { background:'var(--blush)', borderColor:'var(--accent)', color:'var(--espresso)' }
              }
              return (
                <button key={i} onClick={() => handleAnswer(opt)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-1.5 text-left text-sm font-medium transition-all"
                  style={{ ...style, border:`1.5px solid ${style.borderColor}` }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: answered && isCorrect ? '#7BC67A' : answered && isSelected ? 'var(--peach)' : 'var(--biscuit)',
                             color: answered && isCorrect ? '#fff' : answered && isSelected ? 'var(--mocha)' : 'var(--text-muted)' }}>
                    {String.fromCharCode(65+i)}
                  </div>
                  {opt}
                  {answered && isCorrect && <CheckCircle size={16} className="ml-auto flex-shrink-0" style={{ color:'#4CAF50' }} />}
                  {answered && isSelected && !isCorrect && <XCircle size={16} className="ml-auto flex-shrink-0" style={{ color:'var(--accent)' }} />}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                className="mt-4 overflow-hidden">
                <div className="rounded-xl p-4 text-sm"
                  style={{ background: selected===q.correct_answer ? '#EAF7EA' : 'var(--blush)',
                           border:`1px solid ${selected===q.correct_answer ? '#A5D6A7' : 'var(--peach)'}`,
                           color: selected===q.correct_answer ? '#2D6E2D' : 'var(--mocha)' }}>
                  <div className="font-semibold mb-1">
                    {selected===q.correct_answer ? '✨ 答對了！' : '☕ 這題快學會了，再複習一次吧'}
                  </div>
                  <div className="mt-1 text-sm" style={{ color:'var(--text-muted)' }}>
                    {q.explanation}
                  </div>
                  {q.grammar_note && (
                    <div className="mt-2 text-xs px-3 py-2 rounded-lg" style={{ background:'#FEF7E0', color:'#8B6D1F', border:'1px solid #FAC775' }}>
                      📖 {q.grammar_note}
                    </div>
                  )}
                </div>
                <button onClick={next} className="btn-primary w-full justify-center mt-3">
                  {qIdx+1 >= questions.length ? '查看結果 →' : '下一題 →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESULT SCREEN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (screen === 'result') {
    const correct = answers.filter(a => a.isCorrect).length
    const emoji = score >= 80 ? '🎉' : score >= 60 ? '😊' : '☕'
    const msg   = score >= 80 ? '太優秀了！' : score >= 60 ? '不錯，繼續加油！' : '再練習一下，你可以的！'

    return (
      <div className="p-6 max-w-xl mx-auto">
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          className="card p-8 text-center mb-6">
          <div className="text-5xl mb-3">{emoji}</div>
          <div className="font-serif text-3xl font-medium mb-1" style={{ color:'var(--espresso)' }}>
            {score}<span className="text-xl">分</span>
          </div>
          <div className="text-sm mb-4" style={{ color:'var(--text-muted)' }}>{msg}</div>
          <div className="flex justify-center gap-6 text-center">
            <div>
              <div className="font-bold text-xl" style={{ color:'#4CAF50' }}>{correct}</div>
              <div className="text-xs" style={{ color:'var(--text-muted)' }}>答對</div>
            </div>
            <div>
              <div className="font-bold text-xl" style={{ color:'var(--accent)' }}>{answers.length - correct}</div>
              <div className="text-xs" style={{ color:'var(--text-muted)' }}>答錯</div>
            </div>
            <div>
              <div className="font-bold text-xl" style={{ color:'var(--espresso)' }}>{answers.length}</div>
              <div className="text-xs" style={{ color:'var(--text-muted)' }}>總題數</div>
            </div>
          </div>
        </motion.div>

        {/* Review wrong answers */}
        {answers.filter(a => !a.isCorrect).length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-3" style={{ color:'var(--espresso)' }}>
              錯題複習
            </h2>
            <div className="space-y-3">
              {answers.filter(a => !a.isCorrect).map((a, i) => (
                <div key={i} className="card p-4">
                  <div className="text-sm font-medium mb-2" style={{ color:'var(--espresso)' }}>{a.question.question}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg px-3 py-2" style={{ background:'#EAF7EA', color:'#2D6E2D' }}>
                      ✓ {a.question.correct_answer}
                    </div>
                    <div className="rounded-lg px-3 py-2" style={{ background:'var(--blush)', color:'var(--mocha)' }}>
                      ✗ {a.userAnswer}
                    </div>
                  </div>
                  {a.question.explanation && (
                    <div className="mt-2 text-xs" style={{ color:'var(--text-muted)' }}>
                      {a.question.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => { setScreen('setup'); setAnswers([]) }}
            className="btn-secondary flex-1 justify-center gap-2">
            <RotateCcw size={14}/> 重新出題
          </button>
          <button onClick={() => { setFromMistakes(true); generate() }}
            className="btn-primary flex-1 justify-center gap-2">
            <Sparkles size={14}/> 練習錯題
          </button>
        </div>
      </div>
    )
  }

  return null
}
