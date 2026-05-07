'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('登入失敗：帳號或密碼錯誤')
    } else {
      toast.success('歡迎回來 ☕')
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div className="card" style={{ width:'100%', maxWidth:400, padding:'2rem' }}>
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🍵</div>
          <h1 style={{ fontFamily:'serif', fontSize:'1.4rem', fontWeight:500, color:'var(--espresso)', margin:'0 0 4px' }}>
            おかえりなさい
          </h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>歡迎回到 ほっこり日語</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:12 }}>
            <input type="email" placeholder="Email" value={email}
              onChange={e=>setEmail(e.target.value)} required className="input"/>
          </div>
          <div style={{ position:'relative', marginBottom:16 }}>
            <input type={show ? 'text' : 'password'} placeholder="密碼" value={password}
              onChange={e=>setPassword(e.target.value)} required className="input" style={{ paddingRight:40 }}/>
            <button type="button" onClick={() => setShow(!show)}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', fontSize:16 }}>
              {show ? '🙈' : '👁'}
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width:'100%', justifyContent:'center' }}>
            {loading ? '登入中...' : '登入 →'}
          </button>
        </form>

        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px 0' }}>
          <div style={{ flex:1, height:1, background:'var(--biscuit)' }}/>
          <span style={{ fontSize:12, color:'var(--text-light)' }}>或</span>
          <div style={{ flex:1, height:1, background:'var(--biscuit)' }}/>
        </div>

        <button onClick={handleGoogle} className="btn-secondary" style={{ width:'100%', justifyContent:'center', gap:8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          使用 Google 登入
        </button>

        <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginTop:16 }}>
          還沒有帳號？{' '}
          <Link href="/register" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>免費註冊</Link>
        </p>
      </div>
    </div>
  )
}

