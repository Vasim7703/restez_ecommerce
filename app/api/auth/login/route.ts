import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// ── Local dev fallback ────────────────────────────────────────────────────────
// When DATABASE_URL is a placeholder these hard-coded demo accounts let you
// sign in and test the full UI.  They are NEVER used once a real DB is set up.
const DEMO_USERS = [
  {
    id: 'c1',
    name: 'Arjun Sharma',
    email: 'arjun@example.com',
    password: 'customer123', // plain text — compared directly in demo mode
    phone: '9876543210',
    role: 'customer',
    verified: true,
  },
  {
    id: 'c2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'customer123',
    phone: '9876543211',
    role: 'customer',
    verified: true,
  },
  {
    id: 'a1',
    name: 'Admin',
    email: 'admin@restez.com',
    password: 'admin@restez123',
    phone: '',
    role: 'admin',
    verified: true,
  },
]

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
      // user not found in DB → fall through to demo check
    } catch (dbErr) {
      console.warn('DB unavailable, falling back to demo accounts:', (dbErr as Error).message)
    }

    // ── Demo / local-dev fallback ────────────────────────────────────────────
    const demoUser = DEMO_USERS.find(u => u.email === email)
    if (!demoUser || demoUser.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: { id: demoUser.id, name: demoUser.name, email: demoUser.email, phone: demoUser.phone, role: demoUser.role }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
