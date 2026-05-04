'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, BookOpen, Target, TrendingUp, ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { cn, formatRate } from '@/lib/utils'
import type { DailyProgress } from '@/types'

const LEVELS = ['N5','N4','N3','N2','N1'] as const

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number
  sub?: string; color?: string
}) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--blush)' }}>
          <Icon size={16} style={{ color: color ?? 'var(--accent)' }} />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--espresso)' }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>{sub}</div>}
    </motion.div>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [progress, setProgress] = useState<DailyProgress | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', profile.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single()
      .then(({ data }) => setProgress(data as DailyProgress | null))
  }, [profile])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは'
  const wordsGoal   = profile?.daily_goal_words   ?? 20
  const quizzesGoal = profile?.daily_goal_quizzes ?? 10

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
        className="mb-6">
        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{greeting} 👋</p>
        <h1 className="font-serif text-2xl font-medium" style={{ color: 'var(--espresso)' }}>
          {profile?.display_name ?? '同學'}，今天也想學一下日文嗎 ☕
        </h1>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Flame}    label="連續學習" value={`${progress?.streak_day ?? 0} 天`} sub="繼續加油！" color="#E85D04" />
        <StatCard icon={BookOpen} label="今日單字" value={`${progress?.words_studied ?? 0}/${wordsGoal}`} sub={`目標 ${wordsGoal} 個`} />
        <StatCard icon={Target}   label="今日練習" value={`${progress?.quizzes_done ?? 0}/${quizzesGoal}`} sub={`目標 ${quizzesGoal} 題`} />
        <StatCard icon={TrendingUp} label="正確率" value={formatRate(progress?.quizzes_done ?? 0, progress?.quizzes_done ?? 0)} sub="本週平均" />
      </div>

      {/* Today's goals progress */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: 0.1 }}
        className="card p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--espresso)' }}>今日目標進度</h2>
        <div className="space-y-3">
          {[
            { label: '單字', done: progress?.words_studied ?? 0, goal: wordsGoal, emoji: '📇' },
            { label: '練習題', done: progress?.quizzes_done ?? 0, goal: quizzesGoal, emoji: '✏️' },
          ].map(({ label, done, goal, emoji }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>{emoji} {label}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{done} / {goal}</span>
              </div>
              <div className="progress-track">
                <motion.div className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (done / goal) * 100)}%` }}
                  transition={{ delay: 0.3, duration: 0.6 }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Level cards */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--espresso)' }}>選擇學習等級</h2>
      </div>
      <div className="grid grid-cols-5 gap-3 mb-6">
        {LEVELS.map((lvl, i) => (
          <motion.div key={lvl}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.1 * i }}>
            <Link href={`/learn/${lvl}`}
              className={cn('card-hover p-3 text-center block',
                profile?.current_level === lvl ? 'ring-2 ring-[var(--accent)]' : '')}>
              <div className="font-bold text-lg font-serif mb-1" style={{ color: 'var(--espresso)' }}>{lvl}</div>
              <div className={cn('badge mx-auto', `badge-${lvl.toLowerCase()}`)}>
                {['初心者','基礎','中級','中高','高級'][i]}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--espresso)' }}>快速開始</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { href: '/quiz',       emoji: '🎯', title: 'AI 出題練習', desc: '根據弱點個人化出題' },
          { href: '/flashcards', emoji: '📇', title: '今日單字卡',   desc: `${wordsGoal} 張待複習` },
          { href: '/chat',       emoji: '🤖', title: '問 AI 助教',   desc: '文法、翻譯、作文批改' },
        ].map(({ href, emoji, title, desc }) => (
          <Link key={href} href={href}
            className="card-hover p-4 flex items-center gap-3">
            <div className="text-2xl">{emoji}</div>
            <div className="flex-1">
              <div className="font-semibold text-sm" style={{ color: 'var(--espresso)' }}>{title}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-light)' }} />
          </Link>
        ))}
      </div>
    </div>
  )
}
