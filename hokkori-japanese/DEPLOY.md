# ほっこり日語 — 完整部署教學

## 第一步：Supabase 設定
1. 前往 https://supabase.com → New Project
2. SQL Editor 依序執行：schema.sql → phase2.sql → phase3.sql → phase4.sql
3. Authentication → Providers → 開啟 Google OAuth

## 第二步：Stripe（可選，付費功能）
1. 建立 Pro 月訂 NT$299 和年訂 NT$2,490 兩個 Product
2. Webhooks → 加入 /api/stripe/webhook endpoint

## 第三步：Vercel 部署
```bash
git init && git add . && git commit -m "🍵 Initial"
# 推送至 GitHub，然後在 Vercel import
```

Environment Variables（必填）：
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ANTHROPIC_API_KEY
- NEXT_PUBLIC_APP_URL

（Stripe 可選）：
- STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_PRO_MONTHLY / STRIPE_PRICE_PRO_ANNUAL

## Auth Callback（必要）
新增 src/app/auth/callback/route.ts：
```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) { const s = createClient(); await s.auth.exchangeCodeForSession(code) }
  return NextResponse.redirect(`${origin}/dashboard`)
}
```

然後 Supabase → Authentication → URL Configuration 填入你的域名。
