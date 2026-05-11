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

    // Call Supabase's reset password method.
    // This will send an email with either a link or an OTP based on the Supabase dashboard config.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`
    })

    if (error) {
      console.error('Supabase reset password error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists, a password reset email has been sent.'
    })

  } catch (error) {
    console.error('Forgot password API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
