import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'



export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // ── Try real database first ──────────────────────────────────────────────
    try {
      const user = await prisma.user.findUnique({ where: { email } })

      if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
        }

        if (!user.verified) {
          return NextResponse.json({ error: 'Account not verified. Please check your email for the OTP.' }, { status: 400 })
        }

        return NextResponse.json({
          success: true,
          user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        })
      }
      // user not found in DB
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
    } catch (dbErr) {
      console.warn('DB error:', (dbErr as Error).message)
      return NextResponse.json({ error: 'Login failed due to server error' }, { status: 500 })
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
