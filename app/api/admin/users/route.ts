import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { orders: true } },
        orders: { select: { total: true } },
      },
    })

    const result = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      orderCount: u._count.orders,
      totalSpent: u.orders.reduce((sum, o) => sum + o.total, 0),
      // Never expose password hash
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
