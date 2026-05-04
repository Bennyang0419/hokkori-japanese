'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, RotateCcw, Check, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { SRS_LABELS, SRS_COLORS, cn } from '@/lib/utils'
import type { UserFlashcard, SRSQuality } from '@/types'

export default function FlashcardsPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [cards, setCards] = useState<UserFlashcard[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionCorrect, setSessionCorrect] = useState(0)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('user_flashcards')
      .select('*, vocabulary(*)')
      .eq('user_id', profile.id)
      .lte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date')
      .limit(30)
      .then(({ data }) => {
        setCards((data ?? []) as UserFlashcard[])
        setLoading(false)
      })
  }, [profile])

  const current = cards[idx]

  const answer = async (quality: SRSQuality) => {
    if (!current) return
    if (quality >= 3) setSessionCorrect(c => c + 1)
    await supabase.rpc('update_flashcard_srs', { p_card_id: current.id, p_quality: quality })
    if (idx + 1 >= cards.length) { setDone(true) }
    else { setIdx(i => i + 1); setFlipped(false) }
  }

  const word = current?.vocabulary?.word ?? current?.word ?? ''
  const reading = current?.vocabulary?.reading ?? current?.reading ?? ''
  const meaning = current?.vocabulary?.meaning_zh ?? current?.meaning_zh ?? ''
  const level = current?.vocabulary?.level ?? current?.level ?? 'N5'
  const example = current?.vocabulary?.examples?.[0]

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>單字卡載入中...</div>
    </div>
  )

  if (done || cards.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <div className="text-4xl">🎉</div>
      <h2 className="font-serif text-xl" style={{ color: 'var(--espresso)' }}>今日單字完成！</h2>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {cards.length > 0 ? `正確 ${sessionCorrect} / ${cards.length} 張` : '今天沒有待複習的單字'}
      </p>
      <button onClick={() => { setIdx(0); setDone(false); setFlipped(false) }}
        className="btn-secondary gap-2"><RotateCcw size={14} />再複習一次</button>
    </div>
  )

  return (
    <div className="flex flex-col h-full p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-xl font-medium" style={{ color: 'var(--espresso)' }}>單字卡</h1>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{idx + 1} / {cards.length}</span>
      </div>

      {/* Progress */}
      <div className="progress-track mb-6">
        <motion.div className="progress-fill" animate={{ width: `${((idx) / cards.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div className="flashcard-scene flex-1 flex items-center cursor-pointer"
        onClick={() => setFlipped(f => !f)}>
        <motion.div className="flashcard-card w-full"
          style={{ minHeight: 280 }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}>

          {/* Front */}
          <div className="flashcard-front card flex flex-col items-center justify-center p-8 text-center gap-4">
            <span className={cn('badge', `badge-${level.toLowerCase()}`)}>{level}</span>
            <div className="text-xs" style={{ color: 'var(--text-light)' }}>{reading}</div>
            <div className="font-serif text-5xl font-medium" style={{ color: 'var(--espresso)' }}>{word}</div>
            <div className="text-xs mt-4" style={{ color: 'var(--text-light)' }}>點擊翻面查看意思 →</div>
          </div>

          {/* Back */}
          <div className="flashcard-back card flex flex-col items-center justify-center p-8 text-center gap-4"
            style={{ background: 'var(--blush)' }}>
            <span className={cn('badge', `badge-${level.toLowerCase()}`)}>{level}</span>
            <div className="font-serif text-3xl font-medium" style={{ color: 'var(--espresso)' }}>{word}</div>
            <div className="text-xl font-medium" style={{ color: 'var(--mocha)' }}>{meaning}</div>
            {example && (
              <div className="text-sm rounded-xl p-3 mt-2 text-left w-full"
                style={{ background: 'var(--warm)', border: '1px solid var(--peach)' }}>
                <div style={{ color: 'var(--espresso)' }}>{example.jp}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{example.zh}</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* SRS buttons */}
      <AnimatePresence>
        {flipped && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            className="mt-6 space-y-3">
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>你記得多熟？</p>
            <div className="grid grid-cols-3 gap-2">
              {([0,2,4] as SRSQuality[]).map(q => (
                <button key={q} onClick={() => answer(q)}
                  className="py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                  style={{ background: SRS_COLORS[q] + '20', color: SRS_COLORS[q], border: `1.5px solid ${SRS_COLORS[q]}40` }}>
                  {SRS_LABELS[q]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([1,3,5] as SRSQuality[]).map(q => (
                <button key={q} onClick={() => answer(q)}
                  className="py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                  style={{ background: SRS_COLORS[q] + '20', color: SRS_COLORS[q], border: `1.5px solid ${SRS_COLORS[q]}40` }}>
                  {SRS_LABELS[q]}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
