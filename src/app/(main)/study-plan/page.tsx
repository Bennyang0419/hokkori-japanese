'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Calendar, Target, Clock, BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@/hooks/useAuth'
import type { JLPTLevel } from '@/types'

const LEVELS: JLPTLevel[] = ['N5','N4','N3','N2','N1']
const DURATIONS = ['1個月','2個月','3個月','6個月','1年']
const DAILY_TIMES = ['15分鐘','30分鐘','1小時','1.5小時','2小時以上']
const WEAK_AREAS = ['文法','單字','漢字','閱讀','聽解','全部平均']

export default function StudyPlanPage() {
  const { profile } = useAuth()
  const [currentLevel, setCurrentLevel] = useState<JLPTLevel>(profile?.current_level ?? 'N4')
  const [targetLevel,  setTargetLevel]  = useState<JLPTLevel>(profile?.target_level  ?? 'N2')
  const [duration,     setDuration]     = useState('3個月')
  const [dailyTime,    setDailyTime]    = useState('1小時')
  const [weakAreas,    setWeakAreas]    = useState<string[]>(['文法'])
  const [plan,         setPlan]         = useState('')
  const [loading,      setLoading]      = useState(false)

  const toggleWeak = (a: string) =>
    setWeakAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const generate = async () => {
    setLoading(true); setPlan('')
    const prompt = `請幫我制定一份日文學習計畫：
- 目前程度：JLPT ${currentLevel}
- 目標等級：JLPT ${targetLevel}
- 備考時間：${duration}
- 每日學習：${dailyTime}
- 需要加強：${weakAreas.join('、')}

請輸出：
## 📅 整體學習規劃（按週/月分期）
## 📚 每日學習安排（具體時間分配）
## 🎯 各科目重點攻略
## 📇 推薦資源與方法
## ⭐ 每週里程碑目標`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role:'user', content: prompt }] })
      })
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let accum = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of dec.decode(value).split('\n')) {
          if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
            try { accum += JSON.parse(line.slice(6)).text; setPlan(accum) } catch {}
          }
        }
      }
    } catch { setPlan('生成失敗，請再試一次。') }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>
          AI 個人學習計畫
        </h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>
          告訴 AI 你的目標，自動生成專屬備考計畫 ✨
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Config */}
        <div className="space-y-5">
          <div>
            <div className="section-label mb-2">目前程度</div>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map(lv => (
                <button key={lv} onClick={() => setCurrentLevel(lv)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold border-1.5 transition-all"
                  style={{ border:`1.5px solid ${currentLevel===lv ? 'var(--accent)' : 'var(--biscuit)'}`,
                           background: currentLevel===lv ? 'var(--accent)' : 'var(--warm)',
                           color: currentLevel===lv ? '#fff' : 'var(--text-muted)' }}>
                  {lv}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="section-label mb-2">目標等級</div>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map(lv => (
                <button key={lv} onClick={() => setTargetLevel(lv)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold border-1.5 transition-all"
                  style={{ border:`1.5px solid ${targetLevel===lv ? 'var(--caramel)' : 'var(--biscuit)'}`,
                           background: targetLevel===lv ? 'var(--caramel)' : 'var(--warm)',
                           color: targetLevel===lv ? '#fff' : 'var(--text-muted)' }}>
                  {lv}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="section-label mb-2">備考時間</div>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border-1.5 transition-all"
                  style={{ border:`1.5px solid ${duration===d ? 'var(--accent)' : 'var(--biscuit)'}`,
                           background: duration===d ? 'var(--blush)' : 'var(--warm)',
                           color: duration===d ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="section-label mb-2">每日學習時間</div>
            <div className="flex gap-2 flex-wrap">
              {DAILY_TIMES.map(t => (
                <button key={t} onClick={() => setDailyTime(t)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border-1.5 transition-all"
                  style={{ border:`1.5px solid ${dailyTime===t ? 'var(--accent)' : 'var(--biscuit)'}`,
                           background: dailyTime===t ? 'var(--blush)' : 'var(--warm)',
                           color: dailyTime===t ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="section-label mb-2">需要加強的項目（可多選）</div>
            <div className="flex gap-2 flex-wrap">
              {WEAK_AREAS.map(a => (
                <button key={a} onClick={() => toggleWeak(a)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border-1.5 transition-all"
                  style={{ border:`1.5px solid ${weakAreas.includes(a) ? 'var(--accent)' : 'var(--biscuit)'}`,
                           background: weakAreas.includes(a) ? 'var(--blush)' : 'var(--warm)',
                           color: weakAreas.includes(a) ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {weakAreas.includes(a) ? '✓ ' : ''}{a}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="btn-primary w-full justify-center">
            {loading
              ? <><span className="animate-spin inline-block">✨</span> 生成計畫中...</>
              : <><Sparkles size={15}/> 生成我的學習計畫</>}
          </button>
        </div>

        {/* Plan output */}
        <div>
          <div className="section-label mb-2">你的專屬計畫</div>
          <div className="card p-4 overflow-y-auto" style={{ minHeight:320, maxHeight:520 }}>
            {!plan ? (
              <div className="flex flex-col items-center justify-center h-60 gap-3">
                <Calendar size={28} style={{ color:'var(--text-light)' }}/>
                <p className="text-sm text-center" style={{ color:'var(--text-light)' }}>
                  設定好目標後<br/>AI 幫你規劃備考計畫
                </p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
                {loading && <span className="animate-pulse">▌</span>}
              </div>
            )}
          </div>
          {plan && !loading && (
            <button onClick={() => navigator.clipboard.writeText(plan)}
              className="btn-secondary w-full justify-center mt-3 text-sm">
              複製計畫
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
