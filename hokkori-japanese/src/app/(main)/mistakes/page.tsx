'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, CheckCircle, Brain } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { MistakeEntry, JLPTLevel } from '@/types'

const LEVELS: (JLPTLevel | 'all')[] = ['all','N5','N4','N3','N2','N1']

export default function MistakesPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([])
  const [filter, setFilter] = useState<JLPTLevel | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    let q = supabase
      .from('mistake_book')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_resolved', false)
      .order('wrong_count', { ascending: false })
    if (filter !== 'all') q = q.eq('level', filter)
    q.then(({ data }) => { setMistakes((data ?? []) as MistakeEntry[]); setLoading(false) })
  }, [profile, filter])

  const markResolved = async (id: string) => {
    await supabase.from('mistake_book').update({ is_resolved: true }).eq('id', id)
    setMistakes(m => m.filter(x => x.id !== id))
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color: 'var(--espresso)' }}>
          錯題本
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {mistakes.length} 道題目待複習
        </p>
      </div>

      {/* Level filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {LEVELS.map(lv => (
          <button key={lv} onClick={() => setFilter(lv)}
            className={cn('px-4 py-1.5 rounded-full text-xs font-medium border transition-all',
              filter === lv ? 'text-white border-transparent' : 'border-[var(--biscuit)]')}
            style={filter === lv
              ? { background: 'var(--accent)' }
              : { background: 'var(--warm)', color: 'var(--text-muted)' }}>
            {lv === 'all' ? '全部' : lv}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
      ) : mistakes.length === 0 ? (
        <div className="card p-10 text-center">
          <CheckCircle size={32} className="mx-auto mb-3" style={{ color: '#4CAF50' }} />
          <p className="font-medium" style={{ color: 'var(--espresso)' }}>
            {filter === 'all' ? '太棒了，沒有錯題！' : `${filter} 目前沒有錯題 ✨`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mistakes.map((m, i) => (
            <motion.div key={m.id}
              initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.04 }}
              className="card overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <AlertCircle size={15} className="flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--espresso)' }}>
                      {m.question}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {m.level && <span className={cn('badge', `badge-${m.level.toLowerCase()}`)}>{m.level}</span>}
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--blush)', color: 'var(--accent)' }}>
                      錯 {m.wrong_count} 次
                    </span>
                  </div>
                </div>
              </div>

              {expanded === m.id && (
                <motion.div initial={{ height:0 }} animate={{ height:'auto' }}
                  className="px-4 pb-4 border-t space-y-3"
                  style={{ borderColor: 'var(--biscuit)' }}>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl p-3" style={{ background: '#EAF7EA' }}>
                      <div className="text-xs mb-1" style={{ color: '#2E7D32' }}>✓ 正確答案</div>
                      <div style={{ color: '#1B5E20' }}>{m.correct_answer}</div>
                    </div>
                    {m.user_answer && (
                      <div className="rounded-xl p-3" style={{ background: 'var(--blush)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--accent)' }}>✗ 你的答案</div>
                        <div style={{ color: 'var(--mocha)' }}>{m.user_answer}</div>
                      </div>
                    )}
                  </div>
                  {m.question_data?.explanation && (
                    <div className="rounded-xl p-3 text-sm" style={{ background: 'var(--milk)', color: 'var(--text-muted)' }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--espresso)' }}>💡 解析</div>
                      {m.question_data.explanation}
                    </div>
                  )}
                  {m.ai_analysis && (
                    <div className="rounded-xl p-3 text-sm flex gap-2"
                      style={{ background: '#EEE4F8', color: '#4A2A7A' }}>
                      <Brain size={14} className="flex-shrink-0 mt-0.5" />
                      <div><span className="font-semibold">AI 分析：</span>{m.ai_analysis}</div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs gap-1 py-2">
                      <RefreshCw size={12} /> 出相似題
                    </button>
                    <button onClick={() => markResolved(m.id)}
                      className="text-xs px-3 py-2 rounded-xl transition-all"
                      style={{ background: '#EAF7EA', color: '#2E7D32', border: '1px solid #A5D6A7' }}>
                      ✓ 標為已懂
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
