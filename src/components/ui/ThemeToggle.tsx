'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const OPTS = [
    { value:'light',  label:'亮色模式', icon:Sun  },
    { value:'dark',   label:'深色模式', icon:Moon },
    { value:'system', label:'跟隨系統', icon:Monitor },
  ]
  const current = OPTS.find(o => o.value === theme) ?? OPTS[0]
  const Icon = current.icon

  if (compact) {
    return (
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-[var(--milk)]"
        style={{ color:'var(--text-muted)' }}
        title={theme === 'light' ? '切換深色模式' : '切換亮色模式'}>
        <Icon size={16}/>
      </button>
    )
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:bg-[var(--milk)]"
        style={{ color:'var(--text-muted)' }}>
        <Icon size={15}/>
        <span>{current.label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}/>
            <motion.div
              initial={{ opacity:0, scale:0.95, y:-5 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95, y:-5 }}
              transition={{ duration:0.12 }}
              className="absolute right-0 mt-1 w-36 rounded-2xl overflow-hidden z-50"
              style={{ background:'var(--warm)', border:'1px solid var(--biscuit)',
                       boxShadow:'0 8px 24px var(--shadow-md)' }}>
              {OPTS.map(({ value, label, icon:ItemIcon }) => (
                <button key={value}
                  onClick={() => { setTheme(value); setOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-all hover:bg-[var(--milk)]"
                  style={{ color: theme===value ? 'var(--accent)' : 'var(--text-muted)',
                           fontWeight: theme===value ? 600 : 400 }}>
                  <ItemIcon size={14}/>
                  {label}
                  {theme===value && <span className="ml-auto text-xs">✓</span>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
