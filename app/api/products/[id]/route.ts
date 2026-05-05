import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  try {
    const body = await request.json()

    let slug = String(body.slug).slice(0, 200).replace(/[^a-z0-9-]/gi, '-')
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing && existing.id !== resolvedParams.id) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`
    }

    const updatedProduct = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: {
        name: String(body.name).slice(0, 200),
        slug: slug,
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
      ...updatedProduct,
      dimensions: JSON.parse(updatedProduct.dimensions),
      fabric_options: JSON.parse(updatedProduct.fabric_options),
      images: JSON.parse(updatedProduct.images),
      fabric_images: JSON.parse(updatedProduct.fabric_images || '{}'),
    }
    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('Failed to update product:', err)
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A product with this name or slug already exists.' }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  try {
    await prisma.product.delete({ where: { id: resolvedParams.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to delete product:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
