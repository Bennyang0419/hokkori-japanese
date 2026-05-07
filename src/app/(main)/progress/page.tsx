'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

const BADGES = [
  { emoji:'🎯', name:'初次練習',   desc:'完成第一道練習題', earned:true },
  { emoji:'🔥', name:'連續 7 天',  desc:'連續學習 7 天',   earned:true },
  { emoji:'⭐', name:'連續 30 天', desc:'連續學習 30 天',   earned:false },
  { emoji:'📇', name:'百字達人',   desc:'累積 100 個單字',  earned:false },
  { emoji:'🏅', name:'練習達人',   desc:'完成 50 道題目',   earned:false },
  { emoji:'🌸', name:'N5 完成',    desc:'完成 N5 所有文法', earned:false },
  { emoji:'💎', name:'滿分達陣',   desc:'單次測驗 100 分',  earned:false },
  { emoji:'🦉', name:'夜間學習者', desc:'深夜 11 點後學習', earned:false },
]

export default function ProgressPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [history, setHistory] = useState<any[]>([])
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (!profile) return
    supabase.from('daily_progress').select('*')
      .eq('user_id', profile.id)
      .order('date', { ascending: false })
      .limit(365)
      .then(({ data }) => setHistory(data ?? []))
  }, [profile])

  const totalWords   = history.reduce((s,r) => s + (r.words_studied||0), 0)
  const totalQuizzes = history.reduce((s,r) => s + (r.quizzes_done||0), 0)
  const studyDays    = history.filter(r => r.words_studied>0 || r.quizzes_done>0).length
  const currentStreak = history[0]?.streak_day ?? 0
  const dateMap = Object.fromEntries(history.map(r => [r.date, r]))

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate()
  const MONTH_NAMES = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
  const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1)}else setViewMonth(m=>m-1) }
  const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1)}else setViewMonth(m=>m+1) }

  const last7 = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i))
    const str = d.toISOString().split('T')[0]
    return { label:['日','一','二','三','四','五','六'][d.getDay()], prog: dateMap[str], isToday: i===6 }
  })
  const maxQ = Math.max(...last7.map(d=>d.prog?.quizzes_done??0), 1)

  return (
    <div style={{ padding:'1.5rem', maxWidth:900, margin:'0 auto' }}>
      <h1 style={{ fontFamily:'serif', fontSize:'1.5rem', fontWeight:500, color:'var(--espresso)', marginBottom:4 }}>學習進度</h1>
      <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:'1.5rem' }}>每一天的努力都算數 ☕</p>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:'1.5rem' }}>
        {[
          { label:'🔥 連續天數', value:`${currentStreak} 天` },
          { label:'📇 累積單字', value:totalWords },
          { label:'✏️ 累積練習', value:`${totalQuizzes} 題` },
          { label:'📅 學習天數', value:`${studyDays} 天` },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'1rem' }}>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--espresso)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card" style={{ padding:'1.2rem', marginBottom:'1.5rem' }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--espresso)', marginBottom:12 }}>本週練習題數</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:100 }}>
          {last7.map(({ label, prog, isToday }, i) => {
            const cnt = prog?.quizzes_done ?? 0
            const h = Math.max(6, Math.round((cnt/maxQ)*80))
            return (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{cnt||''}</div>
                <div style={{ width:'100%', height:h, borderRadius:'4px 4px 0 0',
                  background: isToday ? 'var(--accent)' : 'var(--biscuit)', minHeight:6 }}/>
                <div style={{ fontSize:11, color: isToday ? 'var(--accent)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 400 }}>{label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Calendar */}
      <div className="card" style={{ padding:'1.2rem', marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--espresso)' }}>{viewYear} 年 {MONTH_NAMES[viewMonth]} 打卡記錄</div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={prevMonth} style={{ padding:'4px 10px', borderRadius:8, border:'1px solid var(--biscuit)', background:'var(--warm)', cursor:'pointer', color:'var(--text-muted)' }}>‹</button>
            <button onClick={nextMonth} style={{ padding:'4px 10px', borderRadius:8, border:'1px solid var(--biscuit)', background:'var(--warm)', cursor:'pointer', color:'var(--text-muted)' }}>›</button>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
          {['日','一','二','三','四','五','六'].map(d => (
            <div key={d} style={{ textAlign:'center', fontSize:11, color:'var(--text-light)', padding:'4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
          {Array(firstDay).fill(null).map((_,i) => <div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const day = i+1
            const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const prog = dateMap[dateStr]
            const hasStudy = prog && (prog.words_studied>0 || prog.quizzes_done>0)
            const isToday = dateStr === new Date().toISOString().split('T')[0]
            return (
              <div key={day} style={{
                aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
                borderRadius:8, fontSize:12, fontWeight: hasStudy ? 600 : 400,
                background: hasStudy ? 'var(--accent)' : isToday ? 'var(--blush)' : 'transparent',
                color: hasStudy ? '#fff' : isToday ? 'var(--accent)' : 'var(--text-muted)',
                border: isToday && !hasStudy ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              }}>{day}</div>
            )
          })}
        </div>
        <div style={{ display:'flex', gap:16, marginTop:10, fontSize:11, color:'var(--text-muted)' }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:12, height:12, borderRadius:3, background:'var(--accent)', display:'inline-block' }}/> 有學習
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:12, height:12, borderRadius:3, background:'transparent', border:'1px solid var(--biscuit)', display:'inline-block' }}/> 未學習
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="card" style={{ padding:'1.2rem' }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--espresso)', marginBottom:12 }}>成就徽章</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))', gap:12 }}>
          {BADGES.map(b => (
            <div key={b.name} style={{ textAlign:'center', opacity: b.earned ? 1 : 0.35 }} title={b.desc}>
              <div style={{ width:52, height:52, borderRadius:14, background: b.earned ? 'var(--blush)' : 'var(--biscuit)', border:`1.5px solid ${b.earned ? 'var(--peach)' : 'transparent'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 6px' }}>
                {b.emoji}
              </div>
              <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.3 }}>{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
