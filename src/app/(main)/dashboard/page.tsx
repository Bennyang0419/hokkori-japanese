'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

const LEVELS = [
  { lv:'N5', zh:'初心者', color:'#B8610A', bg:'#FEF3E2', desc:'基礎文法・800字' },
  { lv:'N4', zh:'基礎級', color:'#2E7D32', bg:'#E8F5E9', desc:'日常會話・1500字' },
  { lv:'N3', zh:'中級',   color:'#1565C0', bg:'#E3F2FD', desc:'一般情境・3750字' },
  { lv:'N2', zh:'中高級', color:'#6A1B9A', bg:'#F3E5F5', desc:'商務日文・6000字' },
  { lv:'N1', zh:'高級',   color:'#880E4F', bg:'#FCE4EC', desc:'近母語・10000字' },
]

const QUICK = [
  { href:'/quiz',       emoji:'🎯', title:'AI 出題',   desc:'個人化練習' },
  { href:'/flashcards', emoji:'📇', title:'單字卡',    desc:'間隔記憶複習' },
  { href:'/chat',       emoji:'🤖', title:'AI 助教',   desc:'問文法・翻譯' },
  { href:'/listening',  emoji:'🎧', title:'聽解練習',  desc:'AI 生成腳本' },
  { href:'/writing',    emoji:'✍️',  title:'寫作工具',  desc:'作文批改' },
  { href:'/mock-exam',  emoji:'📋', title:'模擬考',    desc:'JLPT 仿真' },
]

export default function DashboardPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [progress, setProgress] = useState<any>(null)

  useEffect(() => {
    if (!profile) return
    const today = new Date().toISOString().split('T')[0]
    supabase.from('daily_progress').select('*')
      .eq('user_id', profile.id).eq('date', today).single()
      .then(({ data }) => setProgress(data))
  }, [profile])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'おはようございます 🌅' : hour < 18 ? 'こんにちは ☕' : 'こんばんは 🌙'
  const wordsGoal = profile?.daily_goal_words ?? 20
  const quizGoal = profile?.daily_goal_quizzes ?? 10
  const wordsDone = progress?.words_studied ?? 0
  const quizDone = progress?.quizzes_done ?? 0
  const streak = progress?.streak_day ?? 0

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', padding:'1.5rem' }}>
      <div style={{ maxWidth:960, margin:'0 auto' }}>

        {/* Greeting */}
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>{greeting}</p>
          <h1 style={{ fontFamily:'serif', fontSize:'1.6rem', fontWeight:500, color:'var(--espresso)', margin:0 }}>
            {profile?.display_name ?? '同學'}，今天也想學一下日文嗎？
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:'1.5rem' }}>
          {[
            { label:'🔥 連續天數', value:`${streak} 天`, sub:'繼續加油！' },
            { label:'📇 今日單字', value:`${wordsDone}/${wordsGoal}`, sub:`目標 ${wordsGoal} 個` },
            { label:'✏️ 今日練習', value:`${quizDone}/${quizGoal}`, sub:`目標 ${quizGoal} 題` },
            { label:'⭐ 等級', value: profile?.current_level ?? 'N5', sub:'目前程度' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:'1rem' }}>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:'1.6rem', fontWeight:700, color:'var(--espresso)', lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--text-light)', marginTop:4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Today progress bars */}
        <div className="card" style={{ padding:'1.2rem', marginBottom:'1.5rem' }}>
          <h2 style={{ fontSize:14, fontWeight:600, color:'var(--espresso)', marginBottom:12, margin:'0 0 12px' }}>今日目標進度</h2>
          {[
            { label:'📇 單字', done:wordsDone, goal:wordsGoal },
            { label:'✏️ 練習題', done:quizDone, goal:quizGoal },
          ].map(({ label, done, goal }) => (
            <div key={label} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4, color:'var(--text-muted)' }}>
                <span>{label}</span>
                <span style={{ color:'var(--accent)', fontWeight:600 }}>{done} / {goal}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width:`${Math.min(100,(done/goal)*100)}%` }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Level selector */}
        <h2 style={{ fontSize:14, fontWeight:600, color:'var(--espresso)', marginBottom:10 }}>選擇學習等級</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:'1.5rem' }}>
          {LEVELS.map(({ lv, zh, color, bg, desc }) => (
            <Link key={lv} href={`/learn/${lv}`}
              style={{ textDecoration:'none', display:'block' }}>
              <div className="card-hover" style={{ padding:'1rem', textAlign:'center',
                border: profile?.current_level===lv ? `2px solid ${color}` : '1px solid var(--biscuit)' }}>
                <div style={{ fontFamily:'serif', fontSize:'1.4rem', fontWeight:700, color, marginBottom:4 }}>{lv}</div>
                <div style={{ fontSize:11, fontWeight:600, color, background:bg, padding:'2px 8px', borderRadius:8, display:'inline-block', marginBottom:4 }}>{zh}</div>
                <div style={{ fontSize:10, color:'var(--text-light)' }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <h2 style={{ fontSize:14, fontWeight:600, color:'var(--espresso)', marginBottom:10 }}>快速開始</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
          {QUICK.map(({ href, emoji, title, desc }) => (
            <Link key={href} href={href} style={{ textDecoration:'none' }}>
              <div className="card-hover" style={{ padding:'1rem', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:22 }}>{emoji}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--espresso)' }}>{title}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

