import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// ── Pattern: Resilience & Local-First ─────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Try Database Operations ──────────────────────────────────────────────
    try {
      const { prisma } = await import('@/lib/prisma')
      
      const existingUser = await (prisma as any).user.findUnique({ where: { email } })
      if (existingUser) {
        if (!existingUser.verified) {
          // If the account is unverified, delete it and its OTPs so they can try registering again
          await (prisma as any).otpToken.deleteMany({ where: { email } })
          await (prisma as any).user.delete({ where: { email } })
        } else {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      await (prisma as any).user.create({
        data: {
          name,
          email,
          phone: phone || '',
          password: hashedPassword,
          role: 'customer',
          verified: false
        }
      })

      await (prisma as any).otpToken.create({
        data: {
          email,
          otp,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        }
      })

      // In a real app, send email/SMS here.
      console.log(`\n\n=== OTP FOR ${email}: ${otp} ===\n\n`)

      return NextResponse.json({ success: true, message: 'OTP generated' })

    } catch (dbError) {
      console.error('Database connection failed during registration:', dbError)
      
      // ── Fallback: "Mock Registration" for Demo/Dev Mode ────────────────────
      // If the database is unreachable (e.g. restez.in without credentials),
      // we allow the user to "register" locally so they can see the flow.
      
      return NextResponse.json({ 
        success: true, 
        message: 'OTP generated (Mock Mode)', 
        isMock: true,
        mockOtp: '123456' // In mock mode, we provide a static OTP for the next step
      })
    }
  } catch (error) {
    console.error('Fatal Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
