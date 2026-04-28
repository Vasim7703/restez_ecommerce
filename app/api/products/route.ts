import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await prisma.product.findMany({ include: { reviews: true } })
    const parsed = products.map(p => ({
      ...p,
      dimensions: JSON.parse(p.dimensions),
      fabric_options: JSON.parse(p.fabric_options),
      images: JSON.parse(p.images),
      fabric_images: JSON.parse(p.fabric_images || '{}'),
    }))
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.slug || !body.base_price) {
      return NextResponse.json({ error: 'Missing required fields: name, slug, base_price' }, { status: 400 })
    }

    const newProduct = await prisma.product.create({
      data: {
        name: String(body.name).slice(0, 200),
        slug: String(body.slug).slice(0, 200).replace(/[^a-z0-9-]/gi, '-'),
        description: String(body.description || '').slice(0, 2000),
        base_price: Math.max(0, Number(body.base_price) || 0),
        premium_upcharge: Math.max(0, Number(body.premium_upcharge) || 0),
        category: String(body.category || '').slice(0, 100),
        collection: String(body.collection || '').slice(0, 100),
        material: String(body.material || '').slice(0, 100),
        style: String(body.style || '').slice(0, 100),
        seating_capacity: Math.max(1, Number(body.seating_capacity) || 1),
        dimensions: JSON.stringify(body.dimensions || {}),
        fabric_options: JSON.stringify(body.fabric_options || {}),
        images: JSON.stringify(body.images || {}),
        in_stock: Boolean(body.in_stock),
        featured: Boolean(body.featured),
        fabric_images: JSON.stringify(
          typeof body.fabric_images === 'object' && body.fabric_images !== null
            ? body.fabric_images
            : {}
        ),
      },
    })

    const parsed = {
      ...newProduct,
      dimensions: JSON.parse(newProduct.dimensions),
      fabric_options: JSON.parse(newProduct.fabric_options),
      images: JSON.parse(newProduct.images),
    }
    return NextResponse.json(parsed, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
