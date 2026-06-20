import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Server-side Supabase client ───────────────────────────────────────────────
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Use service role key if available, otherwise fall back to anon key
  // The anon key will work if the RLS policy allows anon access on site_config
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, key, {
    auth: { persistSession: false }
  })
}

// ── Hardcoded fallback data (used when DB is unavailable) ─────────────────────
const FALLBACK_CAROUSEL = {
  slides: [
    {
      title: 'Royal Heritage Collection',
      subtitle: 'Timeless Elegance Meets Modern Comfort',
      image: '/sofas/sofa_emerald_velvet.png',
      cta: 'Explore Collection',
      link: '/products'
    },
    {
      title: 'Imperial Chesterfield Series',
      subtitle: 'Handcrafted Excellence by Artech Artisans',
      image: '/sofas/chesterfield_navy.png',
      cta: 'View Collection',
      link: '/products'
    },
    {
      title: 'Contemporary Luxury',
      subtitle: 'Modern Design, Timeless Craftsmanship',
      image: '/sofas/sofa_charcoal_grey.png',
      cta: 'Shop Now',
      link: '/products'
    }
  ],
  interval: 5000
}

const FALLBACK_FABRICS = [
  { name: 'Emerald Velvet',   img: '/sofas/sofa_emerald_velvet.png',   color: '#1a6b4a' },
  { name: 'Burgundy Velvet',  img: '/sofas/sofa_burgundy_velvet.png',  color: '#7c1f38' },
  { name: 'Navy Blue Velvet', img: '/sofas/sofa_navy_velvet.png',      color: '#1a2f6b' },
  { name: 'Gold Silk',        img: '/sofas/sofa_gold_silk.png',        color: '#b5860d' },
  { name: 'Charcoal Grey',    img: '/sofas/sofa_charcoal_grey.png',    color: '#3d3d3d' },
  { name: 'Royal Purple',     img: '/sofas/sofa_royal_purple.png',     color: '#6b21a8' },
  { name: 'Ivory Cream',      img: '/sofas/sofa_ivory_cream.png',      color: '#c8b48a' },
  { name: 'Terracotta',       img: '/sofas/sofa_terracotta.png',       color: '#c1440e' },
]

const FALLBACK_VIDEO_GALLERY = {
  videos: [
    { title: 'Crafting the Chesterfield', url: 'https://www.youtube.com/watch?v=123', thumbnail: '' },
  ]
}

const FALLBACK_CONTACT_DETAILS = {
  email: 'info@restez.com',
  phone: '+91 9876543210',
  address: '123 Furniture Row, Design District',
  whatsapp: '+91 9876543210'
}

const FALLBACK_ABOUT_PAGE = {
  heading: 'About RESTEZ',
  content: 'We craft premium furniture...',
  image: '/sofas/sofa_emerald_velvet.png'
}

const FALLBACKS: Record<string, unknown> = {
  homepage_carousel: FALLBACK_CAROUSEL,
  homepage_fabrics: FALLBACK_FABRICS,
  video_gallery: FALLBACK_VIDEO_GALLERY,
  contact_details: FALLBACK_CONTACT_DETAILS,
  about_page: FALLBACK_ABOUT_PAGE,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 })
  }

  // ── Try Supabase site_config table first ────────────────────────────────────
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', key)
      .single()

    if (!error && data) {
      return NextResponse.json({ success: true, data: JSON.parse(data.value) })
    }
  } catch {
    // DB unavailable — fall through to hardcoded data
  }

  // ── Return hardcoded fallback ─────────────────────────────────────────────
  const fallback = FALLBACKS[key]
  if (fallback !== undefined) {
    return NextResponse.json({ success: true, data: fallback })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request: Request) {
  try {
    const { key, data } = await request.json()

    if (!key || !data) {
      return NextResponse.json({ error: 'Key and data required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Upsert into site_config table
    const { data: row, error } = await supabase
      .from('site_config')
      .upsert(
        { key, value: JSON.stringify(data), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      .select('value')
      .single()

    if (error) {
      console.error('Supabase CMS save error:', error)
      return NextResponse.json({
        error: 'Failed to save configuration',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(row.value) })
  } catch (error: any) {
    console.error('Error saving CMS config:', error)
    return NextResponse.json({ 
      error: 'Failed to save configuration', 
      details: error.message,
    }, { status: 500 })
  }
}
