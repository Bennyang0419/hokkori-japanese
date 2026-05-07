'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const LEVELS = [
  { lv:'N5', zh:'完全初學者', desc:'從零開始學日文', color:'#B8610A', bg:'#FEF3E2' },
  { lv:'N4', zh:'認識基礎假名', desc:'想加強日常會話', color:'#2E7D32', bg:'#E8F5E9' },
  { lv:'N3', zh:'日常簡單對話', desc:'要提升到中級程度', color:'#1565C0', bg:'#E3F2FD' },
  { lv:'N2', zh:'商務溝通', desc:'準備挑戰中高級', color:'#6A1B9A', bg:'#F3E5F5' },
  { lv:'N1', zh:'近母語程度', desc:'挑戰最高級認證', color:'#880E4F', bg:'#FCE4EC' },
]

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<1|2>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [targetLevel, setTargetLevel] = useState('N3')
  const [loading, setLoading] = useState(false)

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return
    if (password.length < 6) { toast.error('密碼至少需要 6 個字元'); return }
    setStep(2)
  }

  const handleRegister = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) {
      toast.error('註冊失敗：' + error.message)
      setLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('profiles').update({ target_level: targetLevel }).eq('id', data.user.id)
    }
    toast.success('歡迎加入！☕')
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div className="card" style={{ width:'100%', maxWidth:440, padding:'2rem' }}>

        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{ fontSize:36, marginBottom:8 }}>{step===1 ? '🌸' : '🎯'}</div>
          <h1 style={{ fontFamily:'serif', fontSize:'1.4rem', fontWeight:500, color:'var(--espresso)', margin:'0 0 4px' }}>
            {step===1 ? 'はじめまして！' : '你的 JLPT 目標是？'}
          </h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>
            {step===1 ? '建立你的帳號，開始學習日文' : '選擇目標等級，AI 幫你規劃學習計畫'}
          </p>
        </div>

        {/* Step dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:'1.5rem' }}>
          {[1,2].map(s => (
            <div key={s} style={{ width:8, height:8, borderRadius:'50%', background: step>=s ? 'var(--accent)' : 'var(--biscuit)', transition:'all .2s' }}/>
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={handleStep1}>
            <div style={{ marginBottom:12 }}>
              <input placeholder="你的名字" value={name} onChange={e=>setName(e.target.value)} required className="input"/>
            </div>
            <div style={{ marginBottom:12 }}>
              <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required className="input"/>
            </div>
            <div style={{ marginBottom:16 }}>
              <input type="password" placeholder="密碼（至少 6 位）" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} className="input"/>
            </div>
            <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }}>
              下一步 →
            </button>
          </form>
        ) : (
          <div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
              {LEVELS.map(({ lv, zh, desc, color, bg }) => (
                <button key={lv} onClick={() => setTargetLevel(lv)}
                  style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                    borderRadius:12, border:`1.5px solid ${targetLevel===lv ? color : 'var(--biscuit)'}`,
                    background: targetLevel===lv ? bg : 'var(--warm)',
                    cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'all .15s',
                  }}>
                  <span style={{ fontWeight:700, fontSize:14, color, minWidth:24 }}>{lv}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--espresso)' }}>{zh}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{desc}</div>
                  </div>
                  {targetLevel===lv && <span style={{ marginLeft:'auto', color }}>✓</span>}
                </button>
              ))}
            </div>
            <button onClick={handleRegister} disabled={loading} className="btn-primary"
              style={{ width:'100%', justifyContent:'center' }}>
              {loading ? '建立中...' : '開始學習 🎉'}
            </button>
            <button onClick={() => setStep(1)} style={{ width:'100%', marginTop:8, background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'8px' }}>
              ← 返回修改
            </button>
          </div>
        )}

        <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginTop:16 }}>
          已有帳號？ <Link href="/login" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>登入</Link>
        </p>
      </div>
    </div>
  )
}

