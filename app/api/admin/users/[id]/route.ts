import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH update user role
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { role } = await request.json()
    if (!['customer', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}
