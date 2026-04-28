import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 })
    }

    const tokenRecord = await prisma.otpToken.findFirst({
      where: {
        email,
        otp,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Mark as used
    await prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { used: true }
    })

    // Mark user verified
    const user = await prisma.user.update({
      where: { email },
      data: { verified: true }
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      } 
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
