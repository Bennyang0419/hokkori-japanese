'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

const LEVELS = ['all','N5','N4','N3','N2','N1']

export default function MistakesPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [mistakes, setMistakes] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string|null>(null)

  useEffect(() => {
    if (!profile) return
    let q = supabase.from('mistake_book').select('*')
      .eq('user_id', profile.id).eq('is_resolved', false)
      .order('wrong_count', { ascending: false })
    if (filter !== 'all') q = (q as any).eq('level', filter)
    q.then(({ data }) => { setMistakes(data ?? []); setLoading(false) })
  }, [profile, filter])

  const markResolved = async (id: string) => {
    await supabase.from('mistake_book').update({ is_resolved: true }).eq('id', id)
    setMistakes(m => m.filter(x => x.id !== id))
  }

  return (
    <div style={{ padding:'1.5rem', maxWidth:800, margin:'0 auto' }}>
      <h1 style={{ fontFamily:'serif', fontSize:'1.5rem', fontWeight:500, color:'var(--espresso)', marginBottom:4 }}>錯題本</h1>
      <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:'1rem' }}>{mistakes.length} 道題目待複習</p>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:'1rem' }}>
        {LEVELS.map(lv => (
          <button key={lv} onClick={() => setFilter(lv)}
            style={{ padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
              border:`1.5px solid ${filter===lv ? 'var(--accent)' : 'var(--biscuit)'}`,
              background: filter===lv ? 'var(--accent)' : 'var(--warm)',
              color: filter===lv ? '#fff' : 'var(--text-muted)',
            }}>
            {lv==='all' ? '全部' : lv}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color:'var(--text-muted)', fontSize:13 }}>載入中...</div>
      ) : mistakes.length === 0 ? (
        <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
          <div style={{ fontWeight:500, color:'var(--espresso)' }}>太棒了，目前沒有錯題！</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {mistakes.map(m => (
            <div key={m.id} className="card" style={{ overflow:'hidden' }}>
              <div onClick={() => setExpanded(expanded===m.id ? null : m.id)}
                style={{ padding:'1rem', display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--espresso)', marginBottom:4 }}>{m.question}</div>
                  <div style={{ display:'flex', gap:8 }}>
                    {m.level && <span style={{ fontSize:10, fontWeight:600, padding:'2px 6px', borderRadius:6, background:'var(--blush)', color:'var(--mocha)' }}>{m.level}</span>}
                    <span style={{ fontSize:11, color:'var(--accent)' }}>錯 {m.wrong_count} 次</span>
                  </div>
                </div>
                <span style={{ color:'var(--text-light)', fontSize:12 }}>{expanded===m.id ? '▲' : '▾'}</span>
              </div>

              {expanded === m.id && (
                <div style={{ padding:'0 1rem 1rem', borderTop:'1px solid var(--biscuit)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, margin:'12px 0' }}>
                    <div style={{ background:'#EAF7EA', borderRadius:10, padding:'10px 12px' }}>
                      <div style={{ fontSize:11, color:'#2E7D32', marginBottom:4 }}>✓ 正確答案</div>
                      <div style={{ fontSize:13, color:'#1B5E20' }}>{m.correct_answer}</div>
                    </div>
                    {m.user_answer && (
                      <div style={{ background:'var(--blush)', borderRadius:10, padding:'10px 12px' }}>
                        <div style={{ fontSize:11, color:'var(--accent)', marginBottom:4 }}>✗ 你的答案</div>
                        <div style={{ fontSize:13, color:'var(--mocha)' }}>{m.user_answer}</div>
                      </div>
                    )}
                  </div>
                  {m.question_data?.explanation && (
                    <div style={{ background:'var(--milk)', borderRadius:10, padding:'10px 12px', fontSize:13, color:'var(--text-muted)', marginBottom:10, lineHeight:1.6 }}>
                      💡 {m.question_data.explanation}
                    </div>
                  )}
                  <button onClick={() => markResolved(m.id)}
                    style={{ fontSize:12, padding:'7px 14px', borderRadius:999, border:'1px solid #A5D6A7', background:'#EAF7EA', color:'#2E7D32', cursor:'pointer', fontFamily:'inherit' }}>
                    ✓ 標為已懂
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

