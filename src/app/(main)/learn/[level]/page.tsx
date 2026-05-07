'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getLevelContent } from '@/lib/data/content'
import type { JLPTLevel } from '@/lib/data/content'

const TABS = [
  { id:'grammar',  label:'📖 文法' },
  { id:'vocab',    label:'📇 單字' },
  { id:'kanji',    label:'🀄 漢字' },
  { id:'quiz',     label:'✏️ 小測驗' },
]

const LEVEL_INFO: Record<string, { zh: string; desc: string; color: string; bg: string }> = {
  N5: { zh:'初心者', desc:'日文學習的第一步，掌握基本文法和 800 個常用單字', color:'#B8610A', bg:'#FEF3E2' },
  N4: { zh:'基礎級', desc:'能理解日常基礎對話，掌握約 1500 個單字', color:'#2E7D32', bg:'#E8F5E9' },
  N3: { zh:'中級',   desc:'能理解日常情境的日文，掌握約 3750 個單字', color:'#1565C0', bg:'#E3F2FD' },
  N2: { zh:'中高級', desc:'能理解一般日文，適合商務場合使用', color:'#6A1B9A', bg:'#F3E5F5' },
  N1: { zh:'高級',   desc:'近母語程度，能理解複雜日文和抽象內容', color:'#880E4F', bg:'#FCE4EC' },
}

export default function LearnLevelPage() {
  const params = useParams()
  const level = (params?.level as JLPTLevel) || 'N5'
  const [tab, setTab] = useState('grammar')
  const [openCard, setOpenCard] = useState<string | null>(null)
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [quizDone, setQuizDone] = useState(false)

  const info = LEVEL_INFO[level] || LEVEL_INFO.N5
  const { grammar, vocab, kanji } = getLevelContent(level)

  // Simple quiz questions from grammar
  const quizQuestions = [
    { q:'「私＿学生です」に入る助詞は？', options:['は','が','を','に'], answer:'は', explanation:'「は」是主題助詞，標示句子的主題。' },
    { q:'「机の上＿本があります」に入る助詞は？', options:['は','で','に','を'], answer:'に', explanation:'存在場所用「に」，表示「在哪裡有什麼」。' },
    { q:'「図書館＿勉強します」に入る助詞は？', options:['に','で','が','と'], answer:'で', explanation:'動作發生的場所用「で」。存在用「に」，動作用「で」！' },
    { q:'「日本へ行き＿です」正しい形は？', options:['たい','ない','たく','たかった'], answer:'たい', explanation:'「〜たい」表示說話者的願望「想要做⋯」。' },
    { q:'「一緒に食べ＿か」正しい形は？', options:['ません','ましょう','ます','ました'], answer:'ません', explanation:'「〜ませんか」是邀請對方一起做某事的表現，更有禮貌。' },
  ]

  const correctCount = quizDone
    ? quizQuestions.filter((q, i) => quizAnswers[i] === q.answer).length
    : 0

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>

      {/* Header */}
      <div style={{ background:'var(--warm)', borderBottom:'1px solid var(--biscuit)', padding:'1.2rem 1.5rem' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:'1rem', flexWrap:'wrap' }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:info.bg, border:`2px solid ${info.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.3rem', color:info.color, fontFamily:'serif' }}>
              {level}
            </div>
            <div>
              <h1 style={{ fontFamily:'serif', fontSize:'1.4rem', fontWeight:500, color:'var(--espresso)', margin:0 }}>
                {level} {info.zh} 學習區
              </h1>
              <p style={{ fontSize:13, color:'var(--text-muted)', margin:'4px 0 0' }}>{info.desc}</p>
            </div>
          </div>

          {/* Sticky Tabs */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  padding:'8px 18px', borderRadius:999, fontSize:13, fontWeight:500,
                  border:`1.5px solid ${tab===t.id ? 'var(--accent)' : 'var(--biscuit)'}`,
                  background: tab===t.id ? 'var(--accent)' : 'var(--warm)',
                  color: tab===t.id ? '#fff' : 'var(--text-muted)',
                  cursor:'pointer', transition:'all .15s',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'1.5rem' }}>

        {/* ── 文法 ── */}
        {tab === 'grammar' && (
          <div>
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontFamily:'serif', fontSize:'1.2rem', color:'var(--espresso)', margin:'0 0 4px' }}>
                {level} 核心文法
              </h2>
              <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>
                點擊每個文法查看詳細說明和例句
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {grammar.map(g => (
                <div key={g.id}
                  style={{ background:'var(--warm)', border:`1px solid ${openCard===g.id ? 'var(--accent)' : 'var(--biscuit)'}`, borderRadius:14, overflow:'hidden' }}>
                  <div onClick={() => setOpenCard(openCard===g.id ? null : g.id)}
                    style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
                    <div>
                      <div style={{ fontFamily:'serif', fontSize:'1.05rem', color:'var(--espresso)', fontWeight:500 }}>{g.pattern}</div>
                      <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:3 }}>{g.meaning}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:8, background:'var(--blush)', color:'var(--mocha)', border:'1px solid var(--peach)' }}>{level}</span>
                      <span style={{ color:'var(--text-light)', fontSize:14 }}>{openCard===g.id ? '▲' : '▾'}</span>
                    </div>
                  </div>

                  {openCard === g.id && (
                    <div style={{ padding:'0 16px 16px', borderTop:'1px solid var(--biscuit)' }}>
                      <div style={{ paddingTop:12 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', letterSpacing:'0.06em', marginBottom:6 }}>接續方式</div>
                        <div style={{ fontSize:13, color:'var(--text-muted)', background:'var(--cream)', padding:'8px 12px', borderRadius:8, marginBottom:12 }}>{g.structure}</div>

                        <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', letterSpacing:'0.06em', marginBottom:6 }}>例句</div>
                        {g.examples.map((ex, i) => (
                          <div key={i} style={{ borderLeft:'3px solid var(--peach)', paddingLeft:12, marginBottom:10, borderRadius:'0 8px 8px 0', background:'var(--cream)', padding:'10px 12px 10px 14px' }}>
                            <div style={{ fontFamily:'serif', fontSize:'1rem', color:'var(--espresso)' }}>{ex.jp}</div>
                            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{ex.zh}</div>
                          </div>
                        ))}

                        {g.notes && (
                          <>
                            <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', letterSpacing:'0.06em', marginBottom:6, marginTop:8 }}>學習重點</div>
                            <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7, background:'#FEF7E0', padding:'10px 14px', borderRadius:8, border:'1px solid #FAC775' }}>
                              💡 {g.notes}
                            </div>
                          </>
                        )}

                        {g.commonErrors && (
                          <>
                            <div style={{ fontSize:11, fontWeight:700, color:'#C62828', letterSpacing:'0.06em', marginBottom:6, marginTop:8 }}>常見錯誤</div>
                            <div style={{ fontSize:13, color:'#C62828', background:'#FEEBEE', padding:'10px 14px', borderRadius:8, border:'1px solid #FFCDD2' }}>
                              ⚠️ {g.commonErrors}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 單字 ── */}
        {tab === 'vocab' && (
          <div>
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontFamily:'serif', fontSize:'1.2rem', color:'var(--espresso)', margin:'0 0 4px' }}>
                {level} 核心單字
              </h2>
              <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>點擊單字卡翻面查看意思</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
              {vocab.map(v => (
                <div key={v.id}
                  onClick={() => setFlipped(f => ({...f, [v.id]: !f[v.id]}))}
                  style={{
                    background: flipped[v.id] ? 'var(--blush)' : 'var(--warm)',
                    border:`1px solid ${flipped[v.id] ? 'var(--peach)' : 'var(--biscuit)'}`,
                    borderRadius:14, padding:'1rem', textAlign:'center', cursor:'pointer',
                    transition:'all .2s', minHeight:120,
                  }}>
                  {!flipped[v.id] ? (
                    <>
                      <div style={{ fontSize:11, color:'var(--text-light)', marginBottom:4, letterSpacing:'0.06em' }}>{v.reading}</div>
                      <div style={{ fontFamily:'serif', fontSize:'1.6rem', color:'var(--espresso)', marginBottom:4 }}>{v.word}</div>
                      <div style={{ fontSize:11, color:'var(--text-light)', background:'var(--cream)', padding:'2px 8px', borderRadius:8, display:'inline-block' }}>{v.pos}</div>
                      <div style={{ fontSize:11, color:'var(--text-light)', marginTop:8 }}>點擊翻面 →</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily:'serif', fontSize:'1.2rem', color:'var(--espresso)', marginBottom:6 }}>{v.word}</div>
                      <div style={{ fontSize:'1rem', fontWeight:600, color:'var(--mocha)', marginBottom:10 }}>{v.meaning}</div>
                      {v.examples[0] && (
                        <div style={{ fontSize:11, color:'var(--text-muted)', background:'var(--warm)', padding:'6px 8px', borderRadius:8, textAlign:'left' }}>
                          <div>{v.examples[0].jp}</div>
                          <div style={{ color:'var(--text-light)', marginTop:2 }}>{v.examples[0].zh}</div>
                        </div>
                      )}
                      {v.tip && (
                        <div style={{ fontSize:11, color:'var(--accent)', marginTop:6 }}>💡 {v.tip}</div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 漢字 ── */}
        {tab === 'kanji' && (
          <div>
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontFamily:'serif', fontSize:'1.2rem', color:'var(--espresso)', margin:'0 0 4px' }}>
                {level} 漢字
              </h2>
              <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>N5 共 80 個漢字，點擊查看詳細</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10 }}>
              {kanji.map(k => (
                <div key={k.id}
                  onClick={() => setOpenCard(openCard===k.id ? null : k.id)}
                  style={{
                    background:'var(--warm)', border:`1px solid ${openCard===k.id ? 'var(--accent)' : 'var(--biscuit)'}`,
                    borderRadius:12, padding:'14px 10px', textAlign:'center', cursor:'pointer', transition:'all .2s',
                  }}>
                  <div style={{ fontFamily:'serif', fontSize:'2.4rem', color:'var(--espresso)', lineHeight:1.1, marginBottom:8 }}>{k.char}</div>
                  <div style={{ fontSize:11, color:'var(--accent)', marginBottom:2 }}>音：{k.on.join('・')}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>訓：{k.kun.join('・')}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{k.meaning}</div>
                  <div style={{ fontSize:10, color:'var(--text-light)', marginTop:4 }}>{k.strokes}畫</div>

                  {openCard === k.id && (
                    <div style={{ marginTop:10, textAlign:'left' }}>
                      {k.words.map((w, i) => (
                        <div key={i} style={{ background:'var(--cream)', borderRadius:6, padding:'6px 8px', marginBottom:4 }}>
                          <span style={{ fontFamily:'serif', fontSize:'0.9rem', color:'var(--espresso)' }}>{w.word}</span>
                          <span style={{ fontSize:10, color:'var(--text-muted)', marginLeft:4 }}>（{w.reading}）</span>
                          <div style={{ fontSize:11, color:'var(--text-light)' }}>{w.meaning}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 小測驗 ── */}
        {tab === 'quiz' && (
          <div style={{ maxWidth:560, margin:'0 auto' }}>
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontFamily:'serif', fontSize:'1.2rem', color:'var(--espresso)', margin:'0 0 4px' }}>
                {level} 小測驗
              </h2>
              <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>測試你學了多少！</p>
            </div>

            {!quizDone ? (
              <>
                {quizQuestions.map((q, qi) => (
                  <div key={qi} style={{ background:'var(--warm)', border:'1px solid var(--biscuit)', borderRadius:14, padding:'1.2rem', marginBottom:12 }}>
                    <div style={{ fontFamily:'serif', fontSize:'1rem', color:'var(--espresso)', marginBottom:12 }}>
                      {qi+1}. {q.q}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {q.options.map(opt => (
                        <button key={opt}
                          onClick={() => setQuizAnswers(a => ({...a, [qi]: opt}))}
                          style={{
                            padding:'10px 14px', borderRadius:10, textAlign:'left', fontSize:14,
                            border:`1.5px solid ${quizAnswers[qi]===opt ? 'var(--accent)' : 'var(--biscuit)'}`,
                            background: quizAnswers[qi]===opt ? 'var(--blush)' : 'var(--cream)',
                            color: 'var(--espresso)', cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
                          }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  onClick={() => setQuizDone(true)}
                  style={{
                    width:'100%', padding:'14px', borderRadius:999, fontWeight:600, fontSize:14,
                    background: Object.keys(quizAnswers).length < quizQuestions.length ? 'var(--biscuit)' : 'var(--accent)',
                    color: Object.keys(quizAnswers).length < quizQuestions.length ? 'var(--text-light)' : '#fff',
                    border:'none', cursor: Object.keys(quizAnswers).length < quizQuestions.length ? 'not-allowed' : 'pointer',
                    fontFamily:'inherit',
                  }}>
                  提交答案
                </button>
              </>
            ) : (
              <>
                <div style={{ textAlign:'center', padding:'2rem', background:'var(--blush)', borderRadius:16, marginBottom:16, border:'1px solid var(--peach)' }}>
                  <div style={{ fontSize:48, marginBottom:8 }}>{correctCount >= 4 ? '🎉' : '☕'}</div>
                  <div style={{ fontFamily:'serif', fontSize:'2rem', fontWeight:500, color:'var(--espresso)', marginBottom:4 }}>
                    {correctCount} <span style={{ fontSize:'1rem' }}>/ {quizQuestions.length}</span>
                  </div>
                  <div style={{ fontSize:14, color:'var(--text-muted)' }}>
                    {correctCount >= 4 ? '太棒了！文法掌握得很好！' : '再複習一下，你一定可以的 ☕'}
                  </div>
                </div>

                {quizQuestions.map((q, qi) => {
                  const isCorrect = quizAnswers[qi] === q.answer
                  return (
                    <div key={qi} style={{ background:'var(--warm)', border:`1px solid ${isCorrect ? '#A5D6A7' : 'var(--peach)'}`, borderRadius:12, padding:'1rem', marginBottom:10 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
                        <span style={{ fontSize:16 }}>{isCorrect ? '✅' : '❌'}</span>
                        <div style={{ fontFamily:'serif', fontSize:'0.95rem', color:'var(--espresso)' }}>{q.q}</div>
                      </div>
                      <div style={{ fontSize:13, color: isCorrect ? '#2E7D32' : 'var(--accent)', marginBottom:4 }}>
                        正確答案：{q.answer}
                        {!isCorrect && <span style={{ color:'var(--text-muted)' }}>（你的答案：{quizAnswers[qi]}）</span>}
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-muted)', background:'var(--cream)', padding:'8px 10px', borderRadius:8 }}>
                        💡 {q.explanation}
                      </div>
                    </div>
                  )
                })}

                <button onClick={() => { setQuizDone(false); setQuizAnswers({}) }}
                  style={{ width:'100%', padding:'12px', borderRadius:999, border:'1.5px solid var(--biscuit)', background:'var(--warm)', color:'var(--espresso)', cursor:'pointer', fontFamily:'inherit', fontSize:14, marginTop:8 }}>
                  再測一次
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
