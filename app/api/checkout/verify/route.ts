import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireAuth } from '@/lib/auth-guard'

export async function POST(request: Request) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    // Validate all required fields are present and are strings
    if (
      typeof razorpay_order_id !== 'string' || !razorpay_order_id ||
      typeof razorpay_payment_id !== 'string' || !razorpay_payment_id ||
      typeof razorpay_signature !== 'string' || !razorpay_signature
    ) {
      return NextResponse.json({ error: 'Missing or invalid payment fields' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET is not configured')
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 })
    }

    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const generatedSignature = hmac.digest('hex')

    // Timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(razorpay_signature.padEnd(generatedSignature.length, '0'), 'hex')
    const genBuffer = Buffer.from(generatedSignature, 'hex')

    if (
      sigBuffer.length !== genBuffer.length ||
      !crypto.timingSafeEqual(new Uint8Array(sigBuffer), new Uint8Array(genBuffer))
    ) {
      return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Payment verified' })
  } catch {
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
