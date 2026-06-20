import { NextResponse } from 'next/server'

// Razorpay payment verification has been removed.
export async function POST() {
  return NextResponse.json(
    { error: 'Payment verification is not available.' },
    { status: 503 }
  )
}
