import { NextRequest, NextResponse } from 'next/server'
 
// Stripe webhook placeholder - 之後需要付費功能再完整設定
export async function POST(req: NextRequest) {
  return NextResponse.json({ received: true })
}
 
