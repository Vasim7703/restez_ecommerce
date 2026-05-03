import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // ── Pattern: Supabase Auth (Option 1: FREE REAL OTP) ──────────────────────
    // This sends the real OTP email via Supabase's free mail server (2500/mo)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone || '',
        },
      },
    })

    if (error) {
      console.error('Supabase Auth error:', error.message)
      
      // If user already exists, Supabase might return an error or just nothing depending on config
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent to your email!',
      // In Supabase, the user is created in "unverified" state until OTP is entered
      user: data.user 
    })

  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
