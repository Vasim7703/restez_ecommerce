import { NextResponse } from 'next/server'
import { mockProducts } from '@/lib/mockData'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Dynamic import to prevent crash if Prisma client is stale or missing
    const { prisma } = await import('@/lib/prisma')
    
    const products = await (prisma as any).product.findMany({ 
      include: { reviews: true } 
    })
    
    if (!products || products.length === 0) {
      return NextResponse.json(mockProducts)
    }

    const parsed = products.map((p: any) => ({
      ...p,
      dimensions: typeof p.dimensions === 'string' ? JSON.parse(p.dimensions) : p.dimensions,
      fabric_options: typeof p.fabric_options === 'string' ? JSON.parse(p.fabric_options) : p.fabric_options,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
      fabric_images: typeof p.fabric_images === 'string' ? JSON.parse(p.fabric_images || '{}') : (p.fabric_images || {}),
    }))
    
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Products API fallback triggered:', err)
    // Always return an array (mock data) so frontend components don't crash
    return NextResponse.json(mockProducts)
  }
}

export async function POST(request: Request) {
  try {
    const { requireAdmin } = await import('@/lib/auth-guard')
    const { session, error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const { prisma } = await import('@/lib/prisma')

    if (!body.name || !body.slug || !body.base_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newProduct = await (prisma as any).product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        base_price: Number(body.base_price),
        category: body.category || '',
        collection: body.collection || '',
        material: body.material || '',
        style: body.style || '',
        seating_capacity: Number(body.seating_capacity) || 1,
        dimensions: JSON.stringify(body.dimensions || {}),
        fabric_options: JSON.stringify(body.fabric_options || {}),
        images: JSON.stringify(body.images || {}),
        in_stock: Boolean(body.in_stock),
        featured: Boolean(body.featured),
        fabric_images: JSON.stringify(body.fabric_images || {}),
      },
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (err) {
    console.error('Failed to create product:', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
