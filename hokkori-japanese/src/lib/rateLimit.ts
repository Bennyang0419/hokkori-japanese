import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Simple in-memory rate limiter (use Redis/Upstash in production)
const requestMap = new Map<string, { count: number; resetAt: number }>()

interface RateLimitConfig {
  windowMs: number   // time window in ms
  max:      number   // max requests per window
  message?: string
}

const LIMITS: Record<string, RateLimitConfig> = {
  '/api/chat':      { windowMs: 60_000, max: 20,  message: 'AI 助教每分鐘限 20 則訊息' },
  '/api/quiz':      { windowMs: 60_000, max: 10,  message: '每分鐘最多出題 10 次' },
  '/api/upload':    { windowMs: 60_000, max: 5,   message: '每分鐘最多上傳分析 5 次' },
  '/api/listening': { windowMs: 60_000, max: 10,  message: '每分鐘最多生成 10 個腳本' },
}

export function rateLimit(path: string, identifier: string): { ok: boolean; message?: string } {
  const config = LIMITS[path]
  if (!config) return { ok: true }

  const key  = `${path}:${identifier}`
  const now  = Date.now()
  const rec  = requestMap.get(key)

  if (!rec || now > rec.resetAt) {
    requestMap.set(key, { count: 1, resetAt: now + config.windowMs })
    return { ok: true }
  }

  if (rec.count >= config.max) {
    return { ok: false, message: config.message ?? '請求過於頻繁，請稍後再試' }
  }

  rec.count++
  return { ok: true }
}

/** Plan-based feature guard */
export async function requirePro(req: NextRequest): Promise<NextResponse | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

  const { data: profile } = await supabase
    .from('profiles').select('plan').eq('id', user.id).single()

  if ((profile as any)?.plan !== 'pro') {
    return NextResponse.json({
      error: 'Pro 功能',
      message: '此功能需要 Pro 方案，請升級後使用。',
      upgradeUrl: '/billing',
    }, { status: 403 })
  }

  return null // null = allowed
}

/** Daily usage limit for free users */
export async function checkDailyLimit(
  userId: string,
  field: 'quizzes_done' | 'words_studied',
  freeLimit: number
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const supabase = createClient()
  const today    = new Date().toISOString().split('T')[0]

  const { data: profile } = await supabase
    .from('profiles').select('plan').eq('id', userId).single()

  if ((profile as any)?.plan === 'pro') return { allowed: true, used: 0, limit: Infinity }

  const { data: prog } = await supabase
    .from('daily_progress').select(field).eq('user_id', userId).eq('date', today).single()

  const used = (prog as any)?.[field] ?? 0
  return { allowed: used < freeLimit, used, limit: freeLimit }
}
