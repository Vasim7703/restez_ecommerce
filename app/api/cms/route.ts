import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

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

const FALLBACKS: Record<string, unknown> = {
  homepage_carousel: FALLBACK_CAROUSEL,
  homepage_fabrics: FALLBACK_FABRICS,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 })
  }

  // ── Try DB first (may not be available in local dev) ─────────────────────
  try {
    // Dynamic import so a missing/broken Prisma client can't crash the route module
    const { prisma } = await import('@/lib/prisma')
    const config = await (prisma as any).siteConfig.findUnique({ where: { key } })
    if (config) {
      return NextResponse.json({ success: true, data: JSON.parse(config.value) })
    }
  } catch {
    // DB unavailable or model not yet migrated — fall through to hardcoded data
  }

  // ── Return hardcoded fallback ─────────────────────────────────────────────
  const fallback = FALLBACKS[key]
  if (fallback !== undefined) {
    return NextResponse.json({ success: true, data: fallback })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { key, data } = await request.json()

    if (!key || !data) {
      return NextResponse.json({ error: 'Key and data required' }, { status: 400 })
    }

    const { prisma } = await import('@/lib/prisma')
    const config = await (prisma as any).siteConfig.upsert({
      where:  { key },
      update: { value: JSON.stringify(data) },
      create: { key, value: JSON.stringify(data) },
    })

    return NextResponse.json({ success: true, data: JSON.parse(config.value) })
  } catch (error) {
    console.error('Error saving CMS config:', error)
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 })
  }
}
