'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { JLPTLevel } from '@/types'

const LEVELS: JLPTLevel[] = ['N5','N4','N3','N2','N1']
const LEVEL_DESC = ['完全初學者','認識基礎假名','日常簡單對話','商務溝通','近母語程度']

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<1|2>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [targetLevel, setTargetLevel] = useState<JLPTLevel>('N3')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      // Update target level
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ target_level: targetLevel }).eq('id', user.id)
      }
      toast.success('歡迎加入！請確認你的 Email ✉️')
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--cream)' }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="card w-full max-w-sm p-8">

        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🌸</div>
          <h1 className="font-serif text-xl font-medium" style={{ color: 'var(--espresso)' }}>
            はじめまして！
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {step === 1 ? '建立你的帳號' : '你的 JLPT 目標是？'}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[1,2].map(s => (
            <div key={s} className="w-2 h-2 rounded-full transition-all"
              style={{ background: step >= s ? 'var(--accent)' : 'var(--biscuit)' }} />
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-light)' }} />
                <input placeholder="你的名字" value={name}
                  onChange={e => setName(e.target.value)} required
                  className="input pl-9" />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-light)' }} />
                <input type="email" placeholder="Email" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  className="input pl-9" />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-light)' }} />
                <input type="password" placeholder="密碼（至少 6 位）" value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="input pl-9" />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">
                下一步 →
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                選擇你的目標等級，我們會為你量身打造學習計畫
              </p>
              <div className="space-y-2">
                {LEVELS.map((lv, i) => (
                  <button key={lv} type="button"
                    onClick={() => setTargetLevel(lv)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-1.5 transition-all text-left"
                    style={{
                      border: `1.5px solid ${targetLevel === lv ? 'var(--accent)' : 'var(--biscuit)'}`,
                      background: targetLevel === lv ? 'var(--blush)' : 'var(--warm)',
                    }}>
                    <span className={`badge badge-${lv.toLowerCase()}`}>{lv}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{LEVEL_DESC[i]}</span>
                    {targetLevel === lv && <span className="ml-auto text-sm" style={{ color: 'var(--accent)' }}>✓</span>}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center">
                {loading ? '建立中...' : '開始學習 🎉'}
              </button>
            </>
          )}
        </form>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
          已有帳號？{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>登入</Link>
        </p>
      </motion.div>
    </div>
  )
}
