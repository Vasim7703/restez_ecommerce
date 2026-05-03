import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Success! Supabase automatically handles sessions and logging in
    return NextResponse.json({ 
      success: true, 
      user: {
        id: data.user?.id,
        name: data.user?.user_metadata?.full_name,
        email: data.user?.email,
        phone: data.user?.user_metadata?.phone,
        role: 'customer'
      },
      session: data.session
    })

  } catch (error) {
    console.error('OTP API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
