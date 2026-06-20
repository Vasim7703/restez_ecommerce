import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Razorpay integration has been removed.
// This endpoint is kept as a stub that returns 503 so existing clients
// receive a clean error rather than a 404.
export async function POST() {
  return NextResponse.json(
    { error: 'Online payment is not available. Please use Cash on Delivery.' },
    { status: 503 }
  )
}
