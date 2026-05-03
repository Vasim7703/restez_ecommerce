import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // ── Pattern: Supabase Auth Resend ─────────────────────────────────────────
    // Using signInWithOtp will send a fresh verification code to the user.
    // NOTE: Supabase has a 60-second rate limit between resends.
    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      console.error('Supabase Resend error:', error.message)
      
      // Handle the 60-second rate limit error specifically
      if (error.message.includes('60 seconds')) {
        return NextResponse.json({ 
          error: 'Please wait 60 seconds before requesting another code.' 
        }, { status: 429 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'A new OTP has been sent to your email!' })
  } catch (error) {
    console.error('Resend OTP API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
