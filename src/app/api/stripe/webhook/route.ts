import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion:'2024-04-10' })
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error:'Invalid signature' }, { status:400 })
  }

  const supabase = createClient()

  const updatePlan = async (userId: string, plan: 'pro' | 'free', expiresAt?: string) => {
    await supabase.from('profiles').update({
      plan,
      subscription_expires_at: expiresAt ?? null,
    }).eq('id', userId)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      const userId  = session.metadata?.user_id
      if (userId) await updatePlan(userId, 'pro')
      break
    }
    case 'customer.subscription.updated': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.user_id
      if (userId) {
        const active = ['active','trialing'].includes(sub.status)
        await updatePlan(userId, active ? 'pro' : 'free',
          active ? new Date(sub.current_period_end * 1000).toISOString() : undefined)
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.user_id
      if (userId) await updatePlan(userId, 'free')
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.warn('Payment failed for customer:', invoice.customer)
      break
    }
  }

  return NextResponse.json({ received: true })
}
