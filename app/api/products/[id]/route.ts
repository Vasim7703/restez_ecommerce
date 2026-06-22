import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  try {
    const body = await request.json()

    // Generate a unique slug by always appending a random suffix — avoids extra findUnique() DB call
    const baseSlug = String(body.slug || body.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`

    const updatedProduct = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: {
        name: String(body.name).slice(0, 200),
        slug: slug,
        description: String(body.description || '').slice(0, 2000),
        category: String(body.category || '').slice(0, 100),
        collection: String(body.collection || '').slice(0, 100),
        material: String(body.material || '').slice(0, 100),
        style: String(body.style || '').slice(0, 100),
        seating_capacity: Math.max(1, Number(body.seating_capacity) || 1),
        dimensions: JSON.stringify(body.dimensions || {}),
        images: JSON.stringify(body.images || {}),
        in_stock: Boolean(body.in_stock),
        featured: Boolean(body.featured),
        warranty: body.warranty || '5-Year Warranty',
      },
    })

    const parsed = {
      ...updatedProduct,
      dimensions: JSON.parse(updatedProduct.dimensions),
      images: JSON.parse(updatedProduct.images),
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

export async function DELETE(_request: Request, { params }: { params: any }) {
  const resolvedParams = await params;

  try {
    await prisma.product.delete({ where: { id: resolvedParams.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    // P2025 means "Record to delete does not exist", which is fine for a delete operation
    if (err.code === 'P2025') {
      return NextResponse.json({ success: true, message: 'Product already deleted' })
    }
    console.error('Failed to delete product:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
