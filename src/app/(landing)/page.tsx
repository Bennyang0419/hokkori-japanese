'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Sparkles, BookOpen, MessageCircle, Target, BarChart2,
  Headphones, Mic, FileText, ChevronRight, Check, Star,
  ArrowRight, Play
} from 'lucide-react'

const FEATURES = [
  { icon: Sparkles,      color:'#FEF0E8', icolor:'var(--accent)',  title:'AI 智慧出題',    desc:'根據你的程度和弱點，自動生成個人化練習題，每題附詳細解析' },
  { icon: MessageCircle, color:'#E8F0FE', icolor:'#3A6EA8',        title:'AI 日文助教',    desc:'24小時溫柔回應，文法解說、翻譯、作文批改，像家教住在你手機裡' },
  { icon: BookOpen,      color:'#E8F5E9', icolor:'#2E7D32',        title:'N5–N1 完整內容', desc:'從零開始到高級，文法、單字、漢字、閱讀，結構清晰好學習' },
  { icon: Target,        color:'#FEE8EE', icolor:'#C4785A',        title:'JLPT 模擬考',    desc:'完整仿真考試環境，計時作答、自動評分、詳細成績分析' },
  { icon: Headphones,    color:'#F3E5F5', icolor:'#6A1B9A',        title:'AI 聽解練習',    desc:'AI 生成日文對話腳本，TTS 朗讀，配合理解測驗' },
  { icon: Mic,           color:'#E8F5E9', icolor:'#2E7D32',        title:'Shadowing 跟讀', desc:'逐句播放跟讀錄音，對比練習，提升口語語感' },
  { icon: FileText,      color:'#FEF7E0', icolor:'#8B6D1F',        title:'筆記 AI 分析',   desc:'上傳 PDF、圖片、手寫筆記，AI 整理重點並自動出題' },
  { icon: BarChart2,     color:'#E8EDE4', icolor:'#4A8A6A',        title:'學習進度追蹤',   desc:'打卡月曆、連續天數、弱點分析、成就徽章，養成學習習慣' },
]

const TESTIMONIALS = [
  { name:'Emily Chen',   level:'N2 考生', avatar:'🌸', text:'用了兩個月，N3 文法終於不再是弱點了！AI 助教的解說真的很清楚，比補習班老師更有耐心。', stars:5 },
  { name:'Kevin Lin',    level:'N4 備考', avatar:'🍀', text:'每天早上用單字卡複習 20 分鐘，配合 AI 出題，進步速度比以前快很多。界面很舒服，不會有壓力。', stars:5 },
  { name:'Sarah Wang',   level:'N1 挑戰', avatar:'⭐', text:'模擬考功能超實用，可以在真正考試前熟悉題型。AI 分析弱點讓我知道要加強哪裡。', stars:5 },
  { name:'Jason Huang',  level:'N5 初學', avatar:'🎋', text:'完全零基礎，跟著 N5 學習區慢慢來，AI 老師很溫柔，答錯了也不會有壓力。', stars:5 },
]

const PLANS = [
  {
    name: '免費版',
    price: 0,
    period: '',
    desc: '開始你的日文之旅',
    color: 'var(--biscuit)',
    features: [
      'N5 學習內容全部開放',
      '每日 10 道 AI 練習題',
      '每日 20 張單字卡',
      'AI 助教（每日 20 則）',
      '基本進度追蹤',
    ],
    cta: '免費開始',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro 月訂',
    price: 299,
    period: '/ 月',
    desc: '解鎖全部功能，全力備考',
    color: 'var(--accent)',
    features: [
      'N5–N1 全等級內容',
      '無限 AI 練習題',
      '無限單字卡 + 間隔記憶',
      'AI 助教無限對話',
      'JLPT 模擬考無限次',
      'AI 作文批改',
      '筆記 AI 分析',
      'Shadowing 跟讀練習',
      'AI 個人學習計畫',
      '優先客服支援',
    ],
    cta: '開始 Pro 試用',
    href: '/register?plan=pro',
    highlighted: true,
  },
  {
    name: 'Pro 年訂',
    price: 2490,
    period: '/ 年',
    desc: '省下 30%，長期備考首選',
    color: 'var(--caramel)',
    features: [
      '包含所有 Pro 月訂功能',
      '年繳省 30%（約 NT$208/月）',
      '解鎖限定學習報告',
      '優先使用新功能',
    ],
    cta: '選擇年訂',
    href: '/register?plan=annual',
    highlighted: false,
  },
]

const LEVELS = [
  { lv:'N5', zh:'初心者', en:'Beginner',      color:'#B8610A', bg:'#FEF3E2' },
  { lv:'N4', zh:'基礎級', en:'Elementary',    color:'#2E7D32', bg:'#E8F5E9' },
  { lv:'N3', zh:'中級',   en:'Intermediate',  color:'#1565C0', bg:'#E3F2FD' },
  { lv:'N2', zh:'中高級', en:'Upper-Int.',    color:'#6A1B9A', bg:'#F3E5F5' },
  { lv:'N1', zh:'高級',   en:'Advanced',      color:'#880E4F', bg:'#FCE4EC' },
]

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }} transition={{ duration:0.55, delay, ease:'easeOut' }}
      className={className}>
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const [videoOpen, setVideoOpen] = useState(false)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -60])

  return (
    <div style={{ background:'var(--cream)', color:'var(--text-main)' }}>

      {/* ── NAV ────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ background:'rgba(255,252,248,0.92)', borderColor:'var(--biscuit)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background:'linear-gradient(135deg,var(--peach),var(--caramel))' }}>🍵</div>
            <div>
              <div className="font-bold text-sm leading-none" style={{ color:'var(--espresso)' }}>ほっこり日語</div>
              <div className="text-xs opacity-60" style={{ color:'var(--text-muted)' }}>AI 學習平台</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {[['#features','功能'],['#pricing','方案'],['#testimonials','評價']].map(([href,label]) => (
              <a key={href} href={href} className="text-sm transition-colors hover:text-[var(--accent)]"
                style={{ color:'var(--text-muted)' }}>{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm px-4 py-2 hidden md:inline-flex">登入</Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2">免費開始 →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30 pointer-events-none"
          style={{ background:'radial-gradient(circle,var(--peach),transparent)', transform:'translate(30%,-30%)' }}/>
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-25 pointer-events-none"
          style={{ background:'radial-gradient(circle,var(--sage),transparent)', transform:'translate(-30%,30%)' }}/>

        <motion.div style={{ y: heroY }} className="max-w-3xl mx-auto px-6 text-center relative">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background:'var(--blush)', border:'1px solid var(--peach)', color:'var(--accent)' }}>
              ✨ AI 驅動的日文學習體驗
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="font-serif mb-5" style={{ fontSize:'clamp(2.2rem,5vw,3.6rem)', lineHeight:1.25, color:'var(--espresso)', fontWeight:500 }}>
              今天，也想學一下<br/>
              <span style={{ color:'var(--accent)', position:'relative' }}>
                日文
                <svg viewBox="0 0 120 12" className="absolute -bottom-1 left-0 w-full" fill="none">
                  <path d="M2 10 Q60 2 118 10" stroke="var(--peach)" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
              吧 ☕
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-lg mb-8 mx-auto max-w-xl" style={{ color:'var(--text-muted)', lineHeight:1.75 }}>
              從 N5 到 N1，AI 幫你出題、分析弱點、陪你對話。<br/>
              像日系咖啡廳裡的自習時光，沒有壓力，只有進步。
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="flex gap-3 justify-center flex-wrap mb-10">
              <Link href="/register" className="btn-primary text-base px-8 py-3.5 gap-2">
                免費開始學習 <ArrowRight size={16}/>
              </Link>
              <button onClick={() => setVideoOpen(true)}
                className="btn-secondary text-base px-6 py-3.5 gap-2">
                <Play size={14}/> 看功能介紹
              </button>
            </div>
          </FadeUp>

          {/* Level pills */}
          <FadeUp delay={0.4}>
            <div className="flex gap-2 justify-center flex-wrap">
              {LEVELS.map(({ lv, zh, color, bg }) => (
                <div key={lv} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background:bg, color, border:`1px solid ${color}30` }}>
                  {lv} <span className="font-normal opacity-75">{zh}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </motion.div>

        {/* Stats bar */}
        <FadeUp delay={0.5} className="max-w-3xl mx-auto px-6 mt-14">
          <div className="card p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                ['12,000+','JLPT 練習題'],
                ['8,500+','常用單字'],
                ['N5–N1','完整覆蓋'],
                ['24hr','AI 助教'],
              ].map(([num,label]) => (
                <div key={label}>
                  <div className="font-bold text-xl" style={{ color:'var(--espresso)', fontFamily:'Lato,sans-serif' }}>{num}</div>
                  <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── FEATURES ───────────────────────────────── */}
      <section id="features" className="py-20" style={{ background:'var(--milk)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp className="text-center mb-12">
            <div className="section-label mb-2">核心功能</div>
            <h2 className="section-title text-3xl">學習，不只是刷題</h2>
            <p className="text-sm mt-2" style={{ color:'var(--text-muted)' }}>
              每一個功能，都是為了讓你更輕鬆地愛上日文
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.06}>
                <div className="card-hover p-5 h-full">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background:f.color }}>
                    <f.icon size={20} style={{ color:f.icolor }}/>
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5" style={{ color:'var(--espresso)' }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color:'var(--text-muted)' }}>{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <FadeUp className="text-center mb-12">
            <div className="section-label mb-2">使用流程</div>
            <h2 className="section-title text-3xl">三步驟開始學習</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step:'01', emoji:'🎯', title:'選擇你的等級',    desc:'告訴我們你的 JLPT 目標，AI 幫你規劃最適合的學習路線' },
              { step:'02', emoji:'📚', title:'每日練習',        desc:'AI 出題、單字卡、聽解、跟讀，各種學習方式自由搭配' },
              { step:'03', emoji:'📈', title:'追蹤進步',        desc:'打卡記錄、弱點分析、成就徽章，看見自己每天的成長' },
            ].map((item, i) => (
              <FadeUp key={item.step} delay={i * 0.1}>
                <div className="card p-6 text-center">
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <div className="text-xs font-bold mb-2" style={{ color:'var(--accent)', letterSpacing:'0.1em' }}>STEP {item.step}</div>
                  <h3 className="font-semibold mb-2" style={{ color:'var(--espresso)' }}>{item.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color:'var(--text-muted)' }}>{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────── */}
      <section id="testimonials" className="py-20" style={{ background:'var(--milk)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp className="text-center mb-12">
            <div className="section-label mb-2">學員心得</div>
            <h2 className="section-title text-3xl">他們都在用 ほっこり 學日文</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.08}>
                <div className="card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ background:'var(--blush)' }}>{t.avatar}</div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color:'var(--espresso)' }}>{t.name}</div>
                      <div className="text-xs" style={{ color:'var(--text-muted)' }}>{t.level}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array(t.stars).fill(0).map((_, si) => (
                        <Star key={si} size={12} fill="var(--caramel)" style={{ color:'var(--caramel)' }}/>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color:'var(--text-muted)' }}>「{t.text}」</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────── */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <FadeUp className="text-center mb-12">
            <div className="section-label mb-2">方案價格</div>
            <h2 className="section-title text-3xl">選擇最適合你的計畫</h2>
            <p className="text-sm mt-2" style={{ color:'var(--text-muted)' }}>免費試用，喜歡再升級</p>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan, i) => (
              <FadeUp key={plan.name} delay={i * 0.1}>
                <div className={`card p-6 h-full flex flex-col ${plan.highlighted ? 'ring-2' : ''}`}
                  style={{ boxShadow: plan.highlighted ? '0 8px 32px rgba(196,120,90,0.2)' : undefined }}>
                  {plan.highlighted && (
                    <div className="text-xs font-bold text-center py-1 px-3 rounded-full mb-4 self-start"
                      style={{ background:'var(--accent)', color:'#fff' }}>推薦</div>
                  )}
                  <div className="font-bold text-base mb-1" style={{ color:'var(--espresso)' }}>{plan.name}</div>
                  <div className="mb-1">
                    <span className="font-bold text-3xl" style={{ color: plan.highlighted ? 'var(--accent)' : 'var(--espresso)', fontFamily:'Lato,sans-serif' }}>
                      {plan.price === 0 ? '免費' : `NT$${plan.price.toLocaleString()}`}
                    </span>
                    {plan.period && <span className="text-sm ml-1" style={{ color:'var(--text-muted)' }}>{plan.period}</span>}
                  </div>
                  <div className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>{plan.desc}</div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs" style={{ color:'var(--text-muted)' }}>
                        <Check size={13} className="flex-shrink-0 mt-0.5" style={{ color:'var(--accent)' }}/>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}
                    className={plan.highlighted ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}>
                    {plan.cta}
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="py-20" style={{ background:'var(--milk)' }}>
        <FadeUp className="max-w-2xl mx-auto px-6 text-center">
          <div className="card p-10" style={{ background:'linear-gradient(135deg,var(--blush),var(--milk))', borderColor:'var(--peach)' }}>
            <div className="text-4xl mb-4">🌸</div>
            <h2 className="font-serif text-2xl font-medium mb-3" style={{ color:'var(--espresso)' }}>
              今天就開始，每天進步一點點
            </h2>
            <p className="text-sm mb-6" style={{ color:'var(--text-muted)' }}>
              免費加入 ほっこり日語，讓 AI 陪你完成 JLPT 夢想 ☕
            </p>
            <Link href="/register" className="btn-primary text-base px-10 py-4 gap-2">
              免費開始學習 <ChevronRight size={16}/>
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="py-10 border-t" style={{ borderColor:'var(--biscuit)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍵</span>
              <span className="font-bold text-sm" style={{ color:'var(--espresso)' }}>ほっこり日語</span>
              <span className="text-xs" style={{ color:'var(--text-light)' }}>© 2025</span>
            </div>
            <div className="flex gap-6">
              {[['privacy','隱私政策'],['terms','使用條款'],['contact','聯絡我們']].map(([href,label]) => (
                <Link key={href} href={`/${href}`}
                  className="text-xs transition-colors hover:text-[var(--accent)]"
                  style={{ color:'var(--text-muted)' }}>{label}</Link>
              ))}
            </div>
            <div className="text-xs" style={{ color:'var(--text-light)' }}>
              用溫暖的方式，陪你學好日文 · Powered by Claude AI
            </div>
          </div>
        </div>
      </footer>

      {/* Video modal placeholder */}
      {videoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.6)' }}
          onClick={() => setVideoOpen(false)}>
          <div className="card p-8 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="font-serif text-lg mb-2" style={{ color:'var(--espresso)' }}>功能介紹影片</h3>
            <p className="text-sm mb-4" style={{ color:'var(--text-muted)' }}>影片製作中，敬請期待！</p>
            <Link href="/register" className="btn-primary justify-center" onClick={() => setVideoOpen(false)}>
              直接免費試用 →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

