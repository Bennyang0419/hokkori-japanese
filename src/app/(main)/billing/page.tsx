'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Crown, Zap, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id:          'pro_monthly' as const,
    name:        'Pro 月訂',
    price:       'NT$299',
    period:      '/ 月',
    badge:       null,
    highlighted: false,
    features:    ['N5–N1 全部內容','無限 AI 出題','無限 AI 助教對話','模擬考無限次','AI 作文批改','筆記 AI 分析','Shadowing 練習','個人學習計畫'],
  },
  {
    id:          'pro_annual' as const,
    name:        'Pro 年訂',
    price:       'NT$2,490',
    period:      '/ 年',
    badge:       '省 30%',
    highlighted: true,
    features:    ['包含所有月訂功能','約 NT$208/月','解鎖限定學習報告','優先使用新功能','優先客服支援'],
  },
]

export default function BillingPage() {
  const { profile }   = useAuth()
  const searchParams  = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const isPro = profile?.plan === 'pro'

  useEffect(() => {
    if (searchParams.get('success') === '1')  toast.success('訂閱成功！歡迎加入 Pro 🎉')
    if (searchParams.get('canceled') === '1') toast('已取消訂閱流程', { icon:'ℹ️' })
  }, [searchParams])

  const subscribe = async (planId: 'pro_monthly' | 'pro_annual') => {
    setLoading(planId)
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const { url, error } = await res.json()
      if (error) { toast.error(error); return }
      window.location.href = url
    } catch {
      toast.error('發生錯誤，請再試一次')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>訂閱方案</h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>解鎖全部功能，全力備考 JLPT</p>
      </motion.div>

      {/* Current plan */}
      <div className="card p-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: isPro ? 'var(--blush)' : 'var(--milk)' }}>
          {isPro ? <Crown size={20} style={{ color:'var(--accent)' }}/> : <Zap size={20} style={{ color:'var(--text-light)' }}/>}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm" style={{ color:'var(--espresso)' }}>
            目前方案：{isPro ? 'Pro' : '免費版'}
          </div>
          <div className="text-xs" style={{ color:'var(--text-muted)' }}>
            {isPro
              ? `有效期至 ${profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString('zh-TW') : '長期有效'}`
              : '免費版每日限制使用量'}
          </div>
        </div>
        {isPro && (
          <span className="badge" style={{ background:'var(--blush)', color:'var(--accent)', border:'1px solid var(--peach)' }}>
            ✓ Pro
          </span>
        )}
      </div>

      {isPro ? (
        <div className="card p-8 text-center">
          <Crown size={40} className="mx-auto mb-4" style={{ color:'var(--accent)' }}/>
          <h2 className="font-serif text-xl font-medium mb-2" style={{ color:'var(--espresso)' }}>
            你已是 Pro 會員 🎉
          </h2>
          <p className="text-sm mb-5" style={{ color:'var(--text-muted)' }}>
            所有功能無限使用，好好備考 JLPT！
          </p>
          <div className="text-xs p-3 rounded-xl" style={{ background:'var(--milk)', color:'var(--text-muted)' }}>
            如需管理訂閱（取消、更改方案），請聯絡客服或至帳單入口。
          </div>
        </div>
      ) : (
        <>
          <div className="card p-3 mb-5 flex gap-2"
            style={{ background:'#FEF7E0', borderColor:'#FAC775' }}>
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color:'#8B6D1F' }}/>
            <p className="text-xs" style={{ color:'#8B6D1F' }}>
              所有 Pro 方案均提供 <strong>7 天免費試用</strong>，試用期間不會扣款，可隨時取消。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.1 }}
                className="card p-6 flex flex-col"
                style={plan.highlighted ? { boxShadow:'0 8px 32px rgba(196,120,90,0.2)', border:'2px solid var(--accent)' } : {}}>
                <div className="flex items-start justify-between mb-1">
                  <div className="font-bold text-sm" style={{ color:'var(--espresso)' }}>{plan.name}</div>
                  {plan.badge && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background:'var(--accent)', color:'#fff' }}>{plan.badge}</span>
                  )}
                </div>
                <div className="mb-5">
                  <span className="font-bold text-2xl" style={{ color:'var(--espresso)', fontFamily:'Lato,sans-serif' }}>
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color:'var(--text-muted)' }}>{plan.period}</span>
                </div>
                <ul className="space-y-1.5 flex-1 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs" style={{ color:'var(--text-muted)' }}>
                      <Check size={12} style={{ color:'var(--accent)', flexShrink:0 }}/>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => subscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={plan.highlighted ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}>
                  {loading === plan.id ? '跳轉中...' : '開始 7 天試用'}
                </button>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
