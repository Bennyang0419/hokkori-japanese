'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'

const NAV_ITEMS = [
  { href:'/dashboard',  emoji:'🏠', label:'首頁' },
  { href:'/learn/N5',   emoji:'📖', label:'學習' },
  { href:'/quiz',       emoji:'✨', label:'出題' },
  { href:'/flashcards', emoji:'📇', label:'單字卡' },
  { href:'/mistakes',   emoji:'📝', label:'錯題本' },
  { href:'/chat',       emoji:'🤖', label:'AI助教' },
  { href:'/listening',  emoji:'🎧', label:'聽解' },
  { href:'/shadowing',  emoji:'🎙️',  label:'跟讀' },
  { href:'/writing',    emoji:'✍️',  label:'寫作' },
  { href:'/upload',     emoji:'📸', label:'筆記' },
  { href:'/mock-exam',  emoji:'📋', label:'模擬考' },
  { href:'/progress',   emoji:'📊', label:'進度' },
  { href:'/settings',   emoji:'⚙️',  label:'設定' },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>

      {/* ── Sticky Top Nav ── */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(255,252,248,0.97)',
        borderBottom:'1px solid var(--biscuit)',
        backdropFilter:'blur(8px)',
      }}>
        {/* Top bar: logo + sign out */}
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1rem', height:48, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#EDCBB8,#B8936A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🍵</div>
            <span style={{ fontWeight:700, fontSize:14, color:'var(--espresso)' }}>ほっこり日語</span>
          </Link>
          <button onClick={signOut}
            style={{ fontSize:12, color:'var(--text-muted)', background:'none', border:'1px solid var(--biscuit)', borderRadius:999, padding:'5px 12px', cursor:'pointer' }}>
            登出
          </button>
        </div>

        {/* Nav items row - horizontally scrollable on mobile */}
        <div style={{
          overflowX:'auto', display:'flex', gap:4, padding:'6px 12px 6px',
          scrollbarWidth:'none',
          maxWidth:1200, margin:'0 auto',
        }}>
          {NAV_ITEMS.map(({ href, emoji, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href.split('/')[1] ? '/'+href.split('/')[1] : href))
            return (
              <Link key={href} href={href}
                style={{
                  display:'flex', alignItems:'center', gap:4, padding:'5px 10px',
                  borderRadius:20, fontSize:12, fontWeight:500, whiteSpace:'nowrap',
                  textDecoration:'none', flexShrink:0, transition:'all .15s',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'var(--accent)' : 'transparent'}`,
                }}>
                <span>{emoji}</span>
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}
