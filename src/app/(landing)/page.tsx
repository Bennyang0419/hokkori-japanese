import Link from 'next/link'
import { Check } from 'lucide-react'

const FEATURES = [
  { color:'#FEF0E8', emoji:'✨', title:'AI 智慧出題', desc:'根據你的程度和弱點，自動生成個人化練習題，每題附詳細解析' },
  { color:'#E8F0FE', emoji:'💬', title:'AI 日文助教', desc:'24小時溫柔回應，文法解說、翻譯、作文批改，像家教住在你手機裡' },
  { color:'#E8F5E9', emoji:'📖', title:'N5–N1 完整內容', desc:'從零開始到高級，文法、單字、漢字、閱讀，結構清晰好學習' },
  { color:'#FEE8EE', emoji:'📋', title:'JLPT 模擬考', desc:'完整仿真考試環境，計時作答、自動評分、詳細成績分析' },
  { color:'#F3E5F5', emoji:'🎧', title:'AI 聽解練習', desc:'AI 生成日文對話腳本，TTS 朗讀，配合理解測驗' },
  { color:'#E8F5E9', emoji:'🎙️', title:'Shadowing 跟讀', desc:'逐句播放跟讀錄音，對比練習，提升口語語感' },
  { color:'#FEF7E0', emoji:'📸', title:'筆記 AI 分析', desc:'上傳 PDF、圖片、手寫筆記，AI 整理重點並自動出題' },
  { color:'#E8EDE4', emoji:'📊', title:'學習進度追蹤', desc:'打卡月曆、連續天數、弱點分析、成就徽章，養成學習習慣' },
]

const TESTIMONIALS = [
  { name:'Emily Chen', level:'N2 考生', avatar:'🌸', text:'用了兩個月，N3 文法終於不再是弱點了！AI 助教的解說真的很清楚，比補習班老師更有耐心。', stars:5 },
  { name:'Kevin Lin',  level:'N4 備考', avatar:'🍀', text:'每天早上用單字卡複習 20 分鐘，配合 AI 出題，進步速度比以前快很多。界面很舒服，不會有壓力。', stars:5 },
  { name:'Sarah Wang', level:'N1 挑戰', avatar:'⭐', text:'模擬考功能超實用，可以在真正考試前熟悉題型。AI 分析弱點讓我知道要加強哪裡。', stars:5 },
  { name:'Jason Huang',level:'N5 初學', avatar:'🎋', text:'完全零基礎，跟著 N5 學習區慢慢來，AI 老師很溫柔，答錯了也不會有壓力。', stars:5 },
]

const PLANS = [
  {
    name:'免費版', price:'免費', period:'', desc:'開始你的日文之旅',
    highlighted:false,
    features:['N5 學習內容全部開放','每日 10 道 AI 練習題','每日 20 張單字卡','AI 助教（每日 20 則）','基本進度追蹤'],
    cta:'免費開始', href:'/register',
  },
  {
    name:'Pro 月訂', price:'NT$299', period:'/ 月', desc:'解鎖全部功能，全力備考',
    highlighted:true,
    features:['N5–N1 全等級內容','無限 AI 練習題','無限單字卡 + 間隔記憶','AI 助教無限對話','JLPT 模擬考無限次','AI 作文批改','筆記 AI 分析','Shadowing 跟讀練習','AI 個人學習計畫','優先客服支援'],
    cta:'開始 Pro 試用', href:'/register?plan=pro',
  },
  {
    name:'Pro 年訂', price:'NT$2,490', period:'/ 年', desc:'省下 30%，長期備考首選',
    highlighted:false,
    features:['包含所有 Pro 月訂功能','年繳省 30%（約 NT$208/月）','解鎖限定學習報告','優先使用新功能'],
    cta:'選擇年訂', href:'/register?plan=annual',
  },
]

export default function LandingPage() {
  return (
    <div style={{ background:'var(--cream)', minHeight:'100vh' }}>

      {/* NAV */}
      <nav style={{ background:'rgba(255,252,248,0.95)', borderBottom:'1px solid var(--biscuit)', position:'sticky', top:0, zIndex:50, backdropFilter:'blur(8px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 1.5rem', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#EDCBB8,#B8936A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🍵</div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:'var(--espresso)', lineHeight:1 }}>ほっこり日語</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>AI 學習平台</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <Link href="/login" style={{ fontSize:14, color:'var(--text-muted)', textDecoration:'none', padding:'8px 16px' }}>登入</Link>
            <Link href="/register" className="btn-primary" style={{ fontSize:13, padding:'10px 20px' }}>免費開始 →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding:'80px 1.5rem 60px', textAlign:'center', maxWidth:800, margin:'0 auto', position:'relative' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 16px', borderRadius:999, background:'var(--blush)', border:'1px solid var(--peach)', color:'var(--accent)', fontSize:12, fontWeight:600, marginBottom:24 }}>
          ✨ AI 驅動的日文學習體驗
        </div>
        <h1 style={{ fontFamily:"'Noto Serif JP', serif", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:500, color:'var(--espresso)', lineHeight:1.3, marginBottom:20 }}>
          今天，也想學一下日文吧 ☕
        </h1>
        <p style={{ fontSize:17, color:'var(--text-muted)', lineHeight:1.8, marginBottom:36, maxWidth:540, margin:'0 auto 36px' }}>
          從 N5 到 N1，AI 幫你出題、分析弱點、陪你對話。<br/>
          像日系咖啡廳裡的自習時光，沒有壓力，只有進步。
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:48 }}>
          <Link href="/register" className="btn-primary" style={{ fontSize:15, padding:'14px 32px' }}>免費開始學習 →</Link>
          <Link href="/login" className="btn-secondary" style={{ fontSize:15, padding:'14px 28px' }}>已有帳號？登入</Link>
        </div>
        {/* Level pills */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          {[['N5','初心者','#B8610A','#FEF3E2'],['N4','基礎','#2E7D32','#E8F5E9'],['N3','中級','#1565C0','#E3F2FD'],['N2','中高級','#6A1B9A','#F3E5F5'],['N1','高級','#880E4F','#FCE4EC']].map(([lv,zh,color,bg]) => (
            <div key={lv} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:999, background:bg, color, border:`1px solid ${color}30`, fontSize:12, fontWeight:600 }}>
              {lv} <span style={{ fontWeight:400, opacity:0.75 }}>{zh}</span>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div style={{ maxWidth:900, margin:'0 auto 20px', padding:'0 1.5rem' }}>
        <div className="card" style={{ padding:'1.2rem 2rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', textAlign:'center' }}>
            {[['12,000+','JLPT 練習題'],['8,500+','常用單字'],['N5–N1','完整覆蓋'],['24hr','AI 助教']].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontWeight:700, fontSize:'1.6rem', color:'var(--espresso)' }}>{n}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ padding:'60px 1.5rem', background:'var(--milk)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span className="section-label">核心功能</span>
            <h2 style={{ fontFamily:"'Noto Serif JP',serif", fontSize:'2rem', fontWeight:500, color:'var(--espresso)', marginTop:8 }}>學習，不只是刷題</h2>
            <p style={{ color:'var(--text-muted)', fontSize:14, marginTop:8 }}>每一個功能，都是為了讓你更輕鬆地愛上日文</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="card-hover" style={{ padding:'1.4rem' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:f.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:12 }}>{f.emoji}</div>
                <h3 style={{ fontWeight:600, fontSize:14, color:'var(--espresso)', marginBottom:6 }}>{f.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:'60px 1.5rem' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span className="section-label">使用流程</span>
            <h2 style={{ fontFamily:"'Noto Serif JP',serif", fontSize:'2rem', fontWeight:500, color:'var(--espresso)', marginTop:8 }}>三步驟開始學習</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 }}>
            {[
              { step:'01', emoji:'🎯', title:'選擇你的等級', desc:'告訴我們你的 JLPT 目標，AI 幫你規劃最適合的學習路線' },
              { step:'02', emoji:'📚', title:'每日練習', desc:'AI 出題、單字卡、聽解、跟讀，各種學習方式自由搭配' },
              { step:'03', emoji:'📈', title:'追蹤進步', desc:'打卡記錄、弱點分析、成就徽章，看見自己每天的成長' },
            ].map(item => (
              <div key={item.step} className="card" style={{ padding:'1.8rem', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{item.emoji}</div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', letterSpacing:'0.1em', marginBottom:8 }}>STEP {item.step}</div>
                <h3 style={{ fontWeight:600, fontSize:15, color:'var(--espresso)', marginBottom:8 }}>{item.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:'60px 1.5rem', background:'var(--milk)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span className="section-label">學員心得</span>
            <h2 style={{ fontFamily:"'Noto Serif JP',serif", fontSize:'2rem', fontWeight:500, color:'var(--espresso)', marginTop:8 }}>他們都在用 ほっこり 學日文</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card" style={{ padding:'1.4rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--blush)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--espresso)' }}>{t.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t.level}</div>
                  </div>
                  <div style={{ marginLeft:'auto', color:'#B8936A', fontSize:14 }}>{'★'.repeat(t.stars)}</div>
                </div>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>「{t.text}」</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding:'60px 1.5rem' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span className="section-label">方案價格</span>
            <h2 style={{ fontFamily:"'Noto Serif JP',serif", fontSize:'2rem', fontWeight:500, color:'var(--espresso)', marginTop:8 }}>選擇最適合你的計畫</h2>
            <p style={{ color:'var(--text-muted)', fontSize:14, marginTop:8 }}>免費試用，喜歡再升級</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {PLANS.map(plan => (
              <div key={plan.name} className="card" style={{ padding:'1.8rem', display:'flex', flexDirection:'column',
                boxShadow: plan.highlighted ? '0 8px 32px rgba(196,120,90,0.2)' : undefined,
                border: plan.highlighted ? '2px solid var(--accent)' : '1px solid var(--biscuit)' }}>
                {plan.highlighted && (
                  <div style={{ background:'var(--accent)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:999, alignSelf:'flex-start', marginBottom:12 }}>推薦</div>
                )}
                <div style={{ fontWeight:700, fontSize:15, color:'var(--espresso)', marginBottom:6 }}>{plan.name}</div>
                <div style={{ marginBottom:6 }}>
                  <span style={{ fontWeight:700, fontSize:'1.8rem', color: plan.highlighted ? 'var(--accent)' : 'var(--espresso)' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize:13, color:'var(--text-muted)', marginLeft:4 }}>{plan.period}</span>}
                </div>
                <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>{plan.desc}</div>
                <ul style={{ listStyle:'none', padding:0, flex:1, marginBottom:20 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'var(--text-muted)', padding:'4px 0' }}>
                      <Check size={13} style={{ color:'var(--accent)', flexShrink:0, marginTop:2 }}/>{f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={plan.highlighted ? 'btn-primary' : 'btn-secondary'} style={{ textAlign:'center', justifyContent:'center' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'60px 1.5rem', background:'var(--milk)' }}>
        <div style={{ maxWidth:640, margin:'0 auto', textAlign:'center' }}>
          <div className="card" style={{ padding:'3rem 2rem', background:'linear-gradient(135deg,var(--blush),var(--milk))', border:'1px solid var(--peach)' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🌸</div>
            <h2 style={{ fontFamily:"'Noto Serif JP',serif", fontSize:'1.7rem', fontWeight:500, color:'var(--espresso)', marginBottom:12 }}>
              今天就開始，每天進步一點點
            </h2>
            <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>
              免費加入 ほっこり日語，讓 AI 陪你完成 JLPT 夢想 ☕
            </p>
            <Link href="/register" className="btn-primary" style={{ fontSize:15, padding:'14px 36px' }}>
              免費開始學習 →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:'2rem 1.5rem', borderTop:'1px solid var(--biscuit)', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 }}>
          <span style={{ fontSize:20 }}>🍵</span>
          <span style={{ fontWeight:700, fontSize:15, color:'var(--espresso)' }}>ほっこり日語</span>
          <span style={{ fontSize:12, color:'var(--text-light)' }}>© 2025</span>
        </div>
        <div style={{ display:'flex', gap:24, justifyContent:'center', marginBottom:12 }}>
          {[['privacy','隱私政策'],['terms','使用條款'],['contact','聯絡我們']].map(([href,label]) => (
            <Link key={href} href={`/${href}`} style={{ fontSize:12, color:'var(--text-muted)', textDecoration:'none' }}>{label}</Link>
          ))}
        </div>
        <div style={{ fontSize:12, color:'var(--text-light)' }}>
          用溫暖的方式，陪你學好日文 · Powered by Claude AI
        </div>
      </footer>
    </div>
  )
}

