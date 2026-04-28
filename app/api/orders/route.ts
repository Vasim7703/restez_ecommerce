import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } })

    let serverTotal = 0
    const validatedItems = rawItems.map(item => {
      const dbProd = dbProducts.find(p => p.id === item.productId)
      if (!dbProd) throw new Error(`Product ${item.productId} not found`)
      const qty   = Math.max(1, Math.min(10, item.quantity))
      const price = item.fabric_type === 'premium'
        ? dbProd.base_price + dbProd.premium_upcharge
        : dbProd.base_price
      serverTotal += price * qty
      return { productId: item.productId, quantity: qty, fabric_type: item.fabric_type, unit_price: price }
    })

    const discount = Math.min(Math.max(0, Number(body.discount) || 0), serverTotal)
    const total    = serverTotal - discount

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
  } catch (err: any) {
    console.error('Error creating order:', err)
    return NextResponse.json({ error: err.message || 'Failed to process checkout' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  // Admin: no email filter — needs admin session via NextAuth
  // Customer: pass ?email=xxx to get their own orders
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    const orders = await prisma.order.findMany({
      where: email ? { email } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const parsed = orders.map(o => ({
      ...o,
      address: JSON.parse(o.address),
      items:   JSON.parse(o.items),
    }))

    // Fetch all unique product IDs across all orders
    const productIds = new Set<string>()
    parsed.forEach(o => o.items.forEach((i: any) => { if (i.productId) productIds.add(i.productId) }))
    
    const products = await prisma.product.findMany({
      where: { id: { in: Array.from(productIds) } }
    })
    
    // Attach product to items
    parsed.forEach(o => {
      o.items.forEach((i: any) => {
        i.product = products.find(p => p.id === i.productId) || {
          id: i.productId,
          name: 'Deleted Product', 
          images: { main: 'https://via.placeholder.com/150' }, 
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
