'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

export function usePWA() {
  const [swReady,       setSwReady]       = useState(false)
  const [canNotify,     setCanNotify]     = useState(false)
  const [notifyEnabled, setNotifyEnabled] = useState(false)
  const [installable,   setInstallable]   = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const { profile } = useAuth()

  // Register Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        setSwReady(true)
        console.log('[SW] Registered:', reg.scope)
      })
      .catch(err => console.error('[SW] Error:', err))
  }, [])

  // Notification permission
  useEffect(() => {
    if (!('Notification' in window)) return
    setCanNotify(true)
    setNotifyEnabled(Notification.permission === 'granted')
  }, [])

  // Install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallable(true)
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const requestNotifications = async () => {
    if (!canNotify) return false
    const result = await Notification.requestPermission()
    setNotifyEnabled(result === 'granted')
    return result === 'granted'
  }

  const sendTestNotification = () => {
    if (Notification.permission !== 'granted') return
    new Notification('ほっこり日語 ☕', {
      body: '今日の学習時間ですよ！単語カードを復習しましょう。',
      icon: '/icons/icon-192.png',
    })
  }

  const scheduleDailyReminder = async (hour: number, minute: number) => {
    const granted = await requestNotifications()
    if (!granted) return false
    // Store preference (real implementation would use a cron/Edge Function)
    localStorage.setItem('hokkori-reminder', JSON.stringify({ hour, minute, enabled: true }))
    return true
  }

  const installApp = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstallable(false)
    setDeferredPrompt(null)
  }

  return {
    swReady,
    canNotify,
    notifyEnabled,
    installable,
    requestNotifications,
    sendTestNotification,
    scheduleDailyReminder,
    installApp,
  }
}
