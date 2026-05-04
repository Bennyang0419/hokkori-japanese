'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, MessageCircle, Layers, AlertCircle, BarChart2,
  Home, LogOut, ChevronLeft, ChevronRight, User,
  Sparkles, FileText, PenLine, ClipboardList, Calendar,
  Headphones, Mic, Settings
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/lib/store'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

const NAV_GROUPS = [
  { label:'學習', items:[
    { href:'/dashboard',  icon:Home,          label:'ホーム',     sub:'今日のまとめ' },
    { href:'/learn/N5',   icon:BookOpen,      label:'學習區',     sub:'N5〜N1 內容' },
    { href:'/flashcards', icon:Layers,        label:'單字卡',     sub:'間隔記憶 SRS' },
    { href:'/progress',   icon:BarChart2,     label:'進度',       sub:'打卡・統計' },
  ]},
  { label:'AI 練習', items:[
    { href:'/quiz',       icon:Sparkles,      label:'AI 出題',    sub:'個人化練習' },
    { href:'/mock-exam',  icon:ClipboardList, label:'模擬考',     sub:'JLPT 仿真' },
    { href:'/mistakes',   icon:AlertCircle,   label:'錯題本',     sub:'弱點攻克' },
  ]},
  { label:'AI 工具', items:[
    { href:'/chat',       icon:MessageCircle, label:'AI 助教',    sub:'24hr 在線' },
    { href:'/writing',    icon:PenLine,       label:'寫作工具',   sub:'批改・翻譯' },
    { href:'/upload',     icon:FileText,      label:'筆記分析',   sub:'上傳PDF/圖片' },
    { href:'/study-plan', icon:Calendar,      label:'學習計畫',   sub:'AI 個人規劃' },
  ]},
  { label:'口語・聽力', items:[
    { href:'/listening',  icon:Headphones,    label:'聽解練習',   sub:'AI 腳本生成' },
    { href:'/shadowing',  icon:Mic,           label:'跟讀練習',   sub:'Shadowing' },
  ]},
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--cream)' }}>

      <motion.aside
        animate={{ width: sidebarOpen ? 224 : 64 }}
        transition={{ duration:0.25, ease:'easeInOut' }}
        className="flex-shrink-0 flex flex-col border-r overflow-hidden"
        style={{ background:'var(--warm)', borderColor:'var(--biscuit)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor:'var(--biscuit)', minHeight:60 }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
            style={{ background:'linear-gradient(135deg,var(--peach),var(--caramel))' }}>🍵</div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div className="font-bold text-sm leading-none" style={{ color:'var(--espresso)' }}>ほっこり日語</div>
                <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>AI 學習平台</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-none">
          {NAV_GROUPS.map(({ label, items }) => (
            <div key={label}>
              {sidebarOpen && (
                <div className="px-3 py-0.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color:'var(--text-light)' }}>{label}</div>
              )}
              <div className="space-y-0.5 mt-0.5">
                {items.map(({ href, icon:Icon, label:lbl, sub }) => {
                  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  return (
                    <Link key={href} href={href}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150"
                      style={active
                        ? { background:'var(--accent)', color:'#fff' }
                        : { color:'var(--text-muted)' }}
                      title={!sidebarOpen ? lbl : undefined}>
                      <Icon size={15} className="flex-shrink-0"/>
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="min-w-0">
                            <div className="text-xs font-medium leading-tight">{lbl}</div>
                            <div className="text-xs mt-0.5 opacity-60 truncate">{sub}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t space-y-0.5" style={{ borderColor:'var(--biscuit)' }}>
          {/* Theme toggle */}
          <div className={cn('flex', sidebarOpen ? 'justify-start px-1' : 'justify-center')}>
            <ThemeToggle compact={!sidebarOpen}/>
          </div>

          {/* Settings */}
          <Link href="/settings"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all hover:bg-[var(--milk)]"
            style={{ color:'var(--text-muted)' }}>
            <Settings size={14} className="flex-shrink-0"/>
            {sidebarOpen && <span>設定</span>}
          </Link>

          {/* User */}
          {profile && sidebarOpen && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
              style={{ color:'var(--text-muted)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background:'var(--blush)', color:'var(--accent)' }}>
                {profile.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color:'var(--espresso)' }}>
                  {profile.display_name}
                </div>
                <div className="text-xs opacity-60">{profile.current_level} 學習中</div>
              </div>
            </div>
          )}

          <button onClick={signOut}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all hover:bg-[var(--milk)]"
            style={{ color:'var(--text-muted)' }}>
            <LogOut size={14} className="flex-shrink-0"/>
            {sidebarOpen && <span>登出</span>}
          </button>

          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex justify-center py-1.5 rounded-xl transition-all hover:bg-[var(--milk)]"
            style={{ color:'var(--text-light)' }}>
            {sidebarOpen ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
