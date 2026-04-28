import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.verified) {
      return NextResponse.json({ error: 'Account is already verified' }, { status: 400 })
    }

    // Invalidate old OTPs for this email
    await prisma.otpToken.updateMany({
      where: { email, used: false },
      data: { used: true }
    })

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.otpToken.create({
      data: {
        email,
        otp,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
      }
    })

    // In a real app, send email/SMS here. For now, log to console:
    console.log(`\n\n=== RESENT OTP FOR ${email}: ${otp} ===\n\n`)

    return NextResponse.json({ success: true, message: 'OTP resent successfully' })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json({ error: 'Failed to resend OTP' }, { status: 500 })
  }
}
