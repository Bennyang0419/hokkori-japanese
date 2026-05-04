'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Download, Moon, Sun, Monitor, Target, User, Save, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/useAuth'
import { usePWA } from '@/hooks/usePWA'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { JLPTLevel } from '@/types'

const LEVELS: JLPTLevel[] = ['N5','N4','N3','N2','N1']

function SettingSection({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background:'var(--blush)' }}>
          <Icon size={14} style={{ color:'var(--accent)' }}/>
        </div>
        <h2 className="font-semibold text-sm" style={{ color:'var(--espresso)' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { profile, setProfile } = useAuth() as any
  const { theme, setTheme } = useTheme()
  const { canNotify, notifyEnabled, requestNotifications, sendTestNotification,
          scheduleDailyReminder, installable, installApp } = usePWA()
  const supabase = createClient()

  const [name,         setName]         = useState(profile?.display_name ?? '')
  const [targetLevel,  setTargetLevel]  = useState<JLPTLevel>(profile?.target_level ?? 'N3')
  const [dailyWords,   setDailyWords]   = useState(profile?.daily_goal_words ?? 20)
  const [dailyQuizzes, setDailyQuizzes] = useState(profile?.daily_goal_quizzes ?? 10)
  const [reminderHour, setReminderHour] = useState(20)
  const [saved,        setSaved]        = useState(false)

  const saveProfile = async () => {
    if (!profile) return
    const { data } = await supabase.from('profiles').update({
      display_name: name,
      target_level: targetLevel,
      daily_goal_words: dailyWords,
      daily_goal_quizzes: dailyQuizzes,
    }).eq('id', profile.id).select().single()

    if (data) {
      setProfile(data)
      setSaved(true)
      toast.success('設定已儲存 ✓')
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const THEMES = [
    { value:'light',  label:'亮色',  icon:Sun },
    { value:'dark',   label:'深色',  icon:Moon },
    { value:'system', label:'系統',  icon:Monitor },
  ]

  return (
    <div className="p-6 max-w-xl mx-auto space-y-5">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>設定</h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>個人化你的學習體驗</p>
      </motion.div>

      {/* Profile */}
      <SettingSection title="個人資料" icon={User}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color:'var(--text-muted)' }}>顯示名稱</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="input w-full" placeholder="你的名字"/>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color:'var(--text-muted)' }}>目標等級</label>
            <div className="flex gap-2">
              {LEVELS.map(lv => (
                <button key={lv} onClick={() => setTargetLevel(lv)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border-1.5 transition-all"
                  style={{ border:`1.5px solid ${targetLevel===lv?'var(--accent)':'var(--biscuit)'}`,
                           background:targetLevel===lv?'var(--accent)':'var(--warm)',
                           color:targetLevel===lv?'#fff':'var(--text-muted)' }}>
                  {lv}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Daily goals */}
      <SettingSection title="每日學習目標" icon={Target}>
        <div className="space-y-4">
          {[
            { label:'每日單字目標', value:dailyWords, set:setDailyWords, opts:[10,20,30,50], unit:'個' },
            { label:'每日練習題目標', value:dailyQuizzes, set:setDailyQuizzes, opts:[5,10,20,30], unit:'題' },
          ].map(({ label, value, set, opts, unit }) => (
            <div key={label}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium" style={{ color:'var(--text-muted)' }}>{label}</label>
                <span className="text-sm font-bold" style={{ color:'var(--accent)' }}>{value} {unit}</span>
              </div>
              <div className="flex gap-2">
                {opts.map(o => (
                  <button key={o} onClick={() => set(o)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium border-1.5 transition-all"
                    style={{ border:`1.5px solid ${value===o?'var(--accent)':'var(--biscuit)'}`,
                             background:value===o?'var(--blush)':'var(--warm)',
                             color:value===o?'var(--accent)':'var(--text-muted)' }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SettingSection>

      {/* Theme */}
      <SettingSection title="外觀主題" icon={Moon}>
        <div className="flex gap-2">
          {THEMES.map(({ value, label, icon:Icon }) => (
            <button key={value} onClick={() => setTheme(value)}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-1.5 transition-all"
              style={{ border:`1.5px solid ${theme===value?'var(--accent)':'var(--biscuit)'}`,
                       background:theme===value?'var(--blush)':'var(--warm)' }}>
              <Icon size={18} style={{ color:theme===value?'var(--accent)':'var(--text-muted)' }}/>
              <span className="text-xs font-medium"
                style={{ color:theme===value?'var(--accent)':'var(--text-muted)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color:'var(--text-light)' }}>
          深色模式使用溫暖的深棕色調，保護眼睛
        </p>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="學習提醒" icon={Bell}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color:'var(--espresso)' }}>每日提醒</div>
              <div className="text-xs" style={{ color:'var(--text-muted)' }}>
                {notifyEnabled ? '已啟用推播通知' : '開啟後可收到每日學習提醒'}
              </div>
            </div>
            <button onClick={notifyEnabled ? sendTestNotification : requestNotifications}
              className={notifyEnabled ? 'btn-secondary text-sm px-4 py-2' : 'btn-primary text-sm px-4 py-2'}>
              {notifyEnabled ? '測試通知' : '啟用通知'}
            </button>
          </div>

          {notifyEnabled && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium" style={{ color:'var(--text-muted)' }}>提醒時間</label>
              <input type="range" min={6} max={23} value={reminderHour}
                onChange={e => setReminderHour(Number(e.target.value))}
                className="flex-1 accent-[var(--accent)]"/>
              <span className="text-sm font-bold w-12 text-right" style={{ color:'var(--accent)' }}>
                {reminderHour}:00
              </span>
              <button onClick={() => scheduleDailyReminder(reminderHour, 0)}
                className="btn-primary text-xs px-3 py-2">設定</button>
            </div>
          )}
        </div>
      </SettingSection>

      {/* Install PWA */}
      {installable && (
        <SettingSection title="安裝應用程式" icon={Download}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color:'var(--espresso)' }}>
                加入主畫面
              </div>
              <div className="text-xs" style={{ color:'var(--text-muted)' }}>
                像 APP 一樣開啟，離線也能複習單字卡
              </div>
            </div>
            <button onClick={installApp} className="btn-primary text-sm px-4 py-2 gap-2">
              <Download size={14}/> 安裝
            </button>
          </div>
        </SettingSection>
      )}

      {/* Save button */}
      <button onClick={saveProfile}
        className="btn-primary w-full justify-center py-4 gap-2 text-base">
        {saved ? <><Check size={16}/>已儲存！</> : <><Save size={16}/>儲存設定</>}
      </button>
    </div>
  )
}
