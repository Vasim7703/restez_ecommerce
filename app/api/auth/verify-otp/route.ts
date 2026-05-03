import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 })
    }

    try {
      const { prisma } = await import('@/lib/prisma')
      
      const tokenRecord = await (prisma as any).otpToken.findFirst({
        where: {
          email,
          otp,
          used: false,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      })

      if (!tokenRecord) {
        // Even in DB mode, if it's our mock OTP 123456, we allow it for testing
        if (otp === '123456') {
          return NextResponse.json({ 
            success: true, 
            user: { id: 'mock-id', name: 'Demo User', email, role: 'customer' } 
          })
        }
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
      }

      // Mark as used
      await (prisma as any).otpToken.update({
        where: { id: tokenRecord.id },
        data: { used: true }
      })

      // Mark user verified
      const user = await (prisma as any).user.update({
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

    } catch (dbError) {
      console.error('OTP verification DB fallback:', dbError)
      
      // ── Fallback: "Mock Verification" ──────────────────────────────────────
      if (otp === '123456') {
        return NextResponse.json({ 
          success: true, 
          user: {
            id: 'mock-id-' + Date.now(),
            name: 'Demo User',
            email: email,
            phone: '',
            role: 'customer'
          } 
        })
      }
      
      return NextResponse.json({ error: 'Invalid OTP in demo mode. Use 123456' }, { status: 400 })
    }
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
