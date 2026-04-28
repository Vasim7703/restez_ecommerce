import { NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { requireAuth } from '@/lib/auth-guard'

export const dynamic = 'force-dynamic'

const MAX_ORDER_AMOUNT = 10_000_000 // ₹1,00,000 in paise (₹10 lakh max)
const MIN_ORDER_AMOUNT = 100         // ₹1 minimum

export async function POST(request: Request) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { amount, currency = 'INR' } = await request.json()

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Amount must be a number' }, { status: 400 })
    }

    const amountInPaise = Math.round(amount * 100)

    if (amountInPaise < MIN_ORDER_AMOUNT) {
      return NextResponse.json({ error: 'Order amount is too small' }, { status: 400 })
    }
    if (amountInPaise > MAX_ORDER_AMOUNT) {
      return NextResponse.json({ error: 'Order amount exceeds limit' }, { status: 400 })
    }

    // Only allow INR for now
    if (currency !== 'INR') {
      return NextResponse.json({ error: 'Only INR currency is supported' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `rcpt_${Date.now()}`,
    })

    return NextResponse.json({ id: order.id, amount: order.amount, currency: order.currency })
  } catch {
    // Never expose internal SDK error messages to client
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
