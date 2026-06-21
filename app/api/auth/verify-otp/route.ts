import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 })
    }

    // ── Pattern: Supabase Auth (Option 1: FREE REAL OTP) ──────────────────────
    // This verifies the 6-digit code sent to the user's email
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup' // or 'email' depending on how you triggered it
    })

    if (error) {
      console.error('Supabase OTP error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Mark user as verified in Prisma
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { verified: true }
    })

    // Success! Return the user data from Prisma
    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      },
      session: data.session
    })

  } catch (error) {
    console.error('OTP API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
