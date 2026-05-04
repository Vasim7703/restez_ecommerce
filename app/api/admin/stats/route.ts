import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch counts and sums from the database
    const [totalOrders, totalProducts, totalUsers, revenueResult] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
    ])

    const totalRevenue = revenueResult._sum.total || 0

    // Fetch recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        customer: order.customer_name,
        product: 'Multiple Items', // Simplified or you can parse items JSON
        amount: order.total,
        status: order.status,
        date: order.createdAt.toISOString().split('T')[0],
      })),
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
