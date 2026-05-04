'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, BookOpen, Target, TrendingUp, Calendar, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { formatRate } from '@/lib/utils'
import type { DailyProgress } from '@/types'

const MONTHS = ['一','二','三','四','五','六','七','八','九','十','十一','十二']
const DAYS_LABEL = ['日','一','二','三','四','五','六']

const BADGES = [
  { id:'first_quiz',    emoji:'🎯', name:'初次練習',   desc:'完成第一道練習題' },
  { id:'streak_7',      emoji:'🔥', name:'連續 7 天',  desc:'連續學習 7 天' },
  { id:'streak_30',     emoji:'⭐', name:'連續 30 天', desc:'連續學習 30 天' },
  { id:'words_100',     emoji:'📇', name:'百字達人',   desc:'累積學習 100 個單字' },
  { id:'quiz_50',       emoji:'🏅', name:'練習達人',   desc:'完成 50 道練習題' },
  { id:'n5_complete',   emoji:'🌸', name:'N5 完成',    desc:'完成 N5 所有文法' },
  { id:'perfect_score', emoji:'💎', name:'滿分達陣',   desc:'單次測驗 100 分' },
  { id:'night_owl',     emoji:'🦉', name:'夜間學習者', desc:'深夜 11 點後學習' },
]

export default function ProgressPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [history, setHistory]   = useState<DailyProgress[]>([])
  const [today,   setToday]     = useState<DailyProgress | null>(null)
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())

  useEffect(() => {
    if (!profile) return
    supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', profile.id)
      .order('date', { ascending: false })
      .limit(365)
      .then(({ data }) => {
        const rows = (data ?? []) as DailyProgress[]
        setHistory(rows)
        const todayStr = new Date().toISOString().split('T')[0]
        setToday(rows.find(r => r.date === todayStr) ?? null)
      })
  }, [profile])

  // Aggregate stats
  const totalWords   = history.reduce((s,r) => s + r.words_studied, 0)
  const totalQuizzes = history.reduce((s,r) => s + r.quizzes_done, 0)
  const studyDays    = history.filter(r => r.words_studied > 0 || r.quizzes_done > 0).length
  const currentStreak = today?.streak_day ?? 0
  const avgRate      = history.filter(r => r.correct_rate).reduce((s,r) => s+(r.correct_rate??0),0) /
                       (history.filter(r => r.correct_rate).length || 1)

  // Calendar
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate()
  const dateMap = Object.fromEntries(history.map(r => [r.date, r]))

  const calCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`
      return { day: i+1, date: d, prog: dateMap[d] }
    })
  ]

  // Weekly bar chart (last 7 days)
  const last7 = Array.from({ length:7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i))
    const str = d.toISOString().split('T')[0]
    return { label: ['日','一','二','三','四','五','六'][d.getDay()], prog: dateMap[str] }
  })
  const maxQuizzes = Math.max(...last7.map(d => d.prog?.quizzes_done ?? 0), 1)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>
          學習進度
        </h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>
          每一天的努力都算數 ☕
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon:Flame,      label:'連續天數',  value: `${currentStreak} 天`, color:'#E85D04' },
          { icon:BookOpen,   label:'累積單字',  value: totalWords },
          { icon:Target,     label:'累積練習',  value: `${totalQuizzes} 題` },
          { icon:TrendingUp, label:'平均正確率', value: `${Math.round(avgRate*100)}%` },
        ].map(({ icon:Icon, label, value, color }) => (
          <motion.div key={label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} style={{ color: color ?? 'var(--accent)' }}/>
              <span className="text-xs" style={{ color:'var(--text-muted)' }}>{label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color:'var(--espresso)' }}>{value}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="card p-5">
        <div className="text-sm font-semibold mb-4" style={{ color:'var(--espresso)' }}>
          本週練習題數
        </div>
        <div className="flex items-end gap-3 h-28">
          {last7.map(({ label, prog }, i) => {
            const cnt = prog?.quizzes_done ?? 0
            const h = Math.max(8, Math.round((cnt / maxQuizzes) * 100))
            const isToday = i === 6
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-medium" style={{ color:'var(--text-muted)' }}>{cnt || ''}</div>
                <motion.div
                  initial={{ height:8 }} animate={{ height:`${h}%` }}
                  transition={{ delay: i*0.05, duration:0.5 }}
                  className="w-full rounded-t-lg"
                  style={{ background: isToday ? 'var(--accent)' : 'var(--biscuit)',
                           minHeight:8, maxHeight:'100%' }}/>
                <div className="text-xs" style={{ color: isToday ? 'var(--accent)' : 'var(--text-muted)',
                                                   fontWeight: isToday ? 700 : 400 }}>
                  {label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold" style={{ color:'var(--espresso)' }}>
            {viewYear} 年 {MONTHS[viewMonth]} 月 打卡記錄
          </div>
          <div className="flex gap-2">
            <button onClick={() => { const d = new Date(viewYear, viewMonth-1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()) }}
              className="btn-ghost px-2 py-1 text-xs">‹</button>
            <button onClick={() => { const d = new Date(viewYear, viewMonth+1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()) }}
              className="btn-ghost px-2 py-1 text-xs">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_LABEL.map(d => (
            <div key={d} className="text-center text-xs py-1 font-medium" style={{ color:'var(--text-light)' }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calCells.map((cell, i) => {
            if (!cell) return <div key={i}/>
            const hasStudy = cell.prog && (cell.prog.words_studied > 0 || cell.prog.quizzes_done > 0)
            const isToday  = cell.date === new Date().toISOString().split('T')[0]
            return (
              <div key={i}
                className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all"
                style={{
                  background: hasStudy ? 'var(--accent)' : isToday ? 'var(--blush)' : 'transparent',
                  color: hasStudy ? '#fff' : isToday ? 'var(--accent)' : 'var(--text-muted)',
                  border: isToday ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                }}>
                {cell.day}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs" style={{ color:'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background:'var(--accent)' }}/>有學習
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm border" style={{ borderColor:'var(--biscuit)' }}/>未學習
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="card p-5">
        <div className="text-sm font-semibold mb-4" style={{ color:'var(--espresso)' }}>成就徽章</div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {BADGES.map((b, i) => {
            const earned = i < 3 // mock: first 3 earned
            return (
              <div key={b.id} className="flex flex-col items-center gap-1 group relative cursor-default"
                style={{ opacity: earned ? 1 : 0.35 }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: earned ? 'var(--blush)' : 'var(--biscuit)',
                           border:`1.5px solid ${earned ? 'var(--peach)' : 'transparent'}` }}>
                  {b.emoji}
                </div>
                <div className="text-xs text-center leading-tight" style={{ color:'var(--text-muted)' }}>
                  {b.name}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap
                  bg-[var(--espresso)] text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100
                  transition-opacity pointer-events-none z-10">
                  {b.desc}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
