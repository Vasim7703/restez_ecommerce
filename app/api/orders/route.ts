import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockProducts } from '@/lib/mockData'

// Basic input sanitizer
function sanitize(val: unknown, maxLen = 200): string {
  return String(val ?? '').trim().slice(0, maxLen)
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string) {
  return /^\+?[\d\s\-]{7,15}$/.test(phone)
}

/** True when the database is unavailable (no credentials, connection refused, etc.) */
function isDbError(err: unknown): boolean {
  if (!err) return false
  const msg = String((err as any).message ?? '')
  return (
    msg.includes('ENOTFOUND') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('connect ETIMEDOUT') ||
    msg.includes('P1001') || // Prisma: "Can't reach database server"
    msg.includes('P1003') || // Prisma: "Database does not exist"
    msg.includes('Environment variable not found')
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // --- Input validation ---
    const customer_name = sanitize(body.customer_name)
    const email         = sanitize(body.email, 254)
    const phone         = sanitize(body.phone, 20)

    if (!customer_name)
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
    if (!isValidEmail(email))
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    if (phone && !isValidPhone(phone))
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })

    // Map items → { productId, quantity, fabric_type }
    const rawItems: Array<{ productId: string; quantity: number; fabric_type: string }> =
      (body.items || []).map((i: any) => ({
        productId:   String(i.productId || i.product?.id || ''),
        quantity:    Number(i.quantity) || 1,
        fabric_type: String(i.fabric_type || 'standard'),
      }))

    if (!rawItems.length)
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })

    // --- Server-side price recalculation ---
    const productIds = rawItems.map(i => i.productId).filter(Boolean)

    let dbProducts: any[] = []
    let usingMock = false

    try {
      dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } })
    } catch (dbErr) {
      if (isDbError(dbErr)) {
        // DB unavailable — validate prices against mock catalogue
        console.warn('DB unavailable for order validation, using mock product catalogue')
        dbProducts = mockProducts.filter(p => productIds.includes(p.id)) as any[]
        usingMock = true
      } else {
        throw dbErr
      }
    }

    let serverTotal = 0
    const validatedItems = rawItems.map(item => {
      const dbProd = dbProducts.find((p: any) => p.id === item.productId)
      if (!dbProd) throw new Error(`Product not found. Please refresh your cart and try again.`)
      const qty   = Math.max(1, Math.min(10, item.quantity))
      const price = item.fabric_type === 'premium'
        ? (dbProd.base_price ?? 0) + (dbProd.premium_upcharge ?? 0)
        : (dbProd.base_price ?? 0)
      serverTotal += price * qty
      return { productId: item.productId, quantity: qty, fabric_type: item.fabric_type, unit_price: price }
    })

    const discount = Math.min(Math.max(0, Number(body.discount) || 0), serverTotal)
    const total    = serverTotal - discount

    // --- Persist order if DB is available ---
    if (!usingMock) {
      try {
        const newOrder = await prisma.order.create({
          data: {
            customer_name,
            email,
            phone,
            address:        JSON.stringify(body.address || {}),
            items:          JSON.stringify(validatedItems),
            subtotal:       serverTotal,
            discount,
            total,
            status:         'pending',
            payment_method: sanitize(body.payment_method, 50) || 'cod',
            payment_status: sanitize(body.payment_status, 100) || 'Pending',
          },
        })
        return NextResponse.json({ success: true, order: newOrder })
      } catch (saveErr) {
        if (isDbError(saveErr)) {
          console.warn('DB unavailable, returning mock order confirmation')
        } else {
          throw saveErr
        }
      }
    }

    // Mock order confirmation (DB unavailable)
    const mockOrder = {
      id: `MOCK-${Date.now()}`,
      customer_name,
      email,
      phone,
      address: body.address || {},
      items: validatedItems,
      subtotal: serverTotal,
      discount,
      total,
      status: 'pending',
      payment_method: sanitize(body.payment_method, 50) || 'cod',
      payment_status: sanitize(body.payment_status, 100) || 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return NextResponse.json({ success: true, order: mockOrder })

  } catch (err: any) {
    console.error('Error creating order:', err)
    // Never expose raw DB/Prisma errors to the client
    const safeMessage = isDbError(err)
      ? 'Order service temporarily unavailable. Please try again shortly.'
      : (err.message?.length < 200 ? err.message : 'Failed to process checkout')
    return NextResponse.json({ error: safeMessage }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    let orders: any[] = []

    try {
      orders = await prisma.order.findMany({
        where: email ? { email } : undefined,
        orderBy: { createdAt: 'desc' },
      })
    } catch (dbErr) {
      if (isDbError(dbErr)) {
        console.warn('DB unavailable for orders fetch, returning empty list')
        return NextResponse.json([])
      }
      throw dbErr
    }

    const parsed = orders.map(o => ({
      ...o,
      address: JSON.parse(o.address),
      items:   JSON.parse(o.items),
    }))

    // Fetch all unique product IDs across all orders
    const productIds = new Set<string>()
    parsed.forEach(o => o.items.forEach((i: any) => { if (i.productId) productIds.add(i.productId) }))

    let products: any[] = []
    try {
      products = await prisma.product.findMany({
        where: { id: { in: Array.from(productIds) } }
      })
    } catch {
      // Non-fatal: just use empty array, product info will fall back to placeholder below
    }

    // Attach product to items
    parsed.forEach(o => {
      o.items.forEach((i: any) => {
        i.product = products.find((p: any) => p.id === i.productId) || {
          id: i.productId,
          name: 'Unknown Product',
          images: { main: '' },
          material: 'Unknown',
          slug: ''
        }
      })
    })

    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
