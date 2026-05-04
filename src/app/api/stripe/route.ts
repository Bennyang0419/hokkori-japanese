import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion:'2024-04-10' })

const PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  pro_annual:  process.env.STRIPE_PRICE_PRO_ANNUAL!,
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data:{ user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

  const { plan } = await req.json() as { plan: 'pro_monthly' | 'pro_annual' }
  const priceId = PRICES[plan]
  if (!priceId) return NextResponse.json({ error:'Invalid plan' }, { status:400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles').select('stripe_customer_id, email').eq('id', user.id).single()

  let customerId = (profile as any)?.stripe_customer_id as string | undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? '',
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer:            customerId,
    mode:                'subscription',
    payment_method_types:['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=1`,
    cancel_url:  `${appUrl}/billing?canceled=1`,
    metadata:    { user_id: user.id, plan },
    subscription_data: {
      trial_period_days: 7,
      metadata: { user_id: user.id },
    },
    locale: 'zh',
  })

  return NextResponse.json({ url: session.url })
}
