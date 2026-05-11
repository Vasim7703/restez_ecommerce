import { NextResponse } from 'next/server'
import { mockProducts } from '@/lib/mockData'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    const products = await (prisma as any).product.findMany({ 
      include: { reviews: true } 
    })
    
    // Convert Prisma records to match the Product interface
    const parsed = (products || []).map((p: any) => ({
      ...p,
      dimensions: typeof p.dimensions === 'string' ? JSON.parse(p.dimensions) : p.dimensions,
      fabric_options: typeof p.fabric_options === 'string' ? JSON.parse(p.fabric_options) : p.fabric_options,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
      fabric_images: typeof p.fabric_images === 'string' ? JSON.parse(p.fabric_images || '{}') : (p.fabric_images || {}),
    }))
    
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Products API error:', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prisma } = await import('@/lib/prisma')

    if (!body.name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 })
    }

    // Generate slug — suffix with random chars to avoid P2002 constraint
    const baseSlug = (body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    // Always add a random suffix so we never need a pre-check findUnique()
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`

    const newProduct = await (prisma as any).product.create({
      data: {
        name: body.name,
        slug,
        description: body.description || '',
        base_price: Number(body.base_price) || 0,
        category: body.category || '',
        collection: body.collection || '',
        material: body.material || '',
        style: body.style || '',
        seating_capacity: Number(body.seating_capacity) || 1,
        dimensions: JSON.stringify(body.dimensions || {}),
        fabric_options: JSON.stringify(body.fabric_options || { standard: [], premium: [] }),
        images: JSON.stringify(body.images || { main: '' }),
        in_stock: body.in_stock !== false,
        featured: Boolean(body.featured),
        fabric_images: JSON.stringify(body.fabric_images || {}),
        premium_upcharge: Number(body.premium_upcharge) || 0,
      },
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (err: any) {
    console.error('CRITICAL: Failed to create product:', err)
    return NextResponse.json({
      error: err.message || 'Failed to create product',
      details: err.message,
      code: err.code,
    }, { status: 500 })
  }
}
