import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      if (!existingUser.verified) {
        // If the account is unverified, delete it and its OTPs so they can try registering again
        await prisma.otpToken.deleteMany({ where: { email } })
        await prisma.user.delete({ where: { email } })
      } else {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || '',
        password: hashedPassword,
        role: 'customer',
        verified: false
      }
    })

    await prisma.otpToken.create({
      data: {
        email,
        otp,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
      }
    })

    // In a real app, send email/SMS here. For now, log to console:
    console.log(`\n\n=== OTP FOR ${email}: ${otp} ===\n\n`)

    return NextResponse.json({ success: true, message: 'OTP generated' })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
