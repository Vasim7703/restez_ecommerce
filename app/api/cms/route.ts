import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 })
  }

  try {
    const config = await prisma.siteConfig.findUnique({ where: { key } })
    if (!config) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: JSON.parse(config.value) })
  } catch (error) {
    console.error('Error fetching CMS config:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { key, data } = await request.json()

    if (!key || !data) {
      return NextResponse.json({ error: 'Key and data required' }, { status: 400 })
    }

    const config = await prisma.siteConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(data) },
      create: { key, value: JSON.stringify(data) },
    })

    return NextResponse.json({ success: true, data: JSON.parse(config.value) })
  } catch (error) {
    console.error('Error saving CMS config:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
