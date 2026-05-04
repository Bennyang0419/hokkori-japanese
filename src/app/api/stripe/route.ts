import { NextRequest, NextResponse } from 'next/server'
 
// Stripe checkout placeholder - 之後需要付費功能再完整設定
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Stripe 尚未設定' }, { status: 501 })
}
