import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// The strict order of operations
const PIPELINE = [
  'pending',
  'carcass_manufacturing',
  'carcass_done',
  'polish',
  'polish_done',
  'foaming',
  'foaming_done',
  'upholstry',
  'upholstry_done',
  'ready_for_qc',
  'qc_done',
  'packing',
  'packing_done',
  'ready_for_dispatch',
  'dispatch',
  'delivered'
]

// Which department is allowed to transition which states?
// When a department scans, we look at the current status.
const DEPARTMENT_TRANSITIONS: Record<string, string[]> = {
  'carcass_manufacturing': ['carcass_manufacturing'], // Can transition FROM carcass_manufacturing TO carcass_done
  'polish': ['carcass_done', 'polish'], // Can accept from carcass_done (becomes polish), or finish polish (becomes polish_done)
  'foaming': ['polish_done', 'foaming'],
  'upholstry': ['foaming_done', 'upholstry'],
  'ready_for_qc': ['upholstry_done', 'ready_for_qc'],
  'packing': ['qc_done', 'packing'],
  'ready_for_dispatch': ['packing_done', 'ready_for_dispatch'],
  // Dispatch dept handles the final handoff to logistics
  'dispatch': ['ready_for_dispatch', 'dispatch']
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, department, itemIndex, pieceIndex } = body

    if (!orderId || !department) {
      return NextResponse.json({ error: 'Missing orderId or department' }, { status: 400 })
    }

    let order = await prisma.order.findUnique({ where: { id: orderId } })
    
    // Fallback for short manual IDs
    if (!order) {
      order = await prisma.order.findFirst({
        where: { id: { endsWith: orderId.toLowerCase() } }
      })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const items = JSON.parse(order.items || '[]')

    // Piece-level tracking
    if (itemIndex !== undefined && pieceIndex !== undefined) {
      const item = items[itemIndex]
      if (!item) return NextResponse.json({ error: 'Item not found in order' }, { status: 404 })

      const qty = Number(item.quantity) || 1
      if (!item.piece_statuses) {
        item.piece_statuses = Array(qty).fill(order.status)
      }

      const currentStatus = item.piece_statuses[pieceIndex] || order.status
      const allowedTransitions = DEPARTMENT_TRANSITIONS[department]

      if (!allowedTransitions || !allowedTransitions.includes(currentStatus)) {
        return NextResponse.json({ error: `Department '${department}' cannot scan piece currently in '${currentStatus.replace(/_/g, ' ')}' status.` }, { status: 400 })
      }

      const currentIndex = PIPELINE.indexOf(currentStatus)
      const nextStatus = PIPELINE[currentIndex + 1]

      if (!nextStatus) {
        return NextResponse.json({ error: 'Piece is already fully processed' }, { status: 400 })
      }

      item.piece_statuses[pieceIndex] = nextStatus

      // Compute aggregate order status
      let minPipelineIndex = PIPELINE.length - 1
      items.forEach((i: any) => {
        const iQty = Number(i.quantity) || 1
        const statuses = i.piece_statuses || Array(iQty).fill(order.status)
        statuses.forEach((s: string) => {
          const sIdx = PIPELINE.indexOf(s)
          if (sIdx !== -1 && sIdx < minPipelineIndex) {
            minPipelineIndex = sIdx
          }
        })
      })

      const newOrderStatus = PIPELINE[minPipelineIndex] || order.status

      await prisma.order.update({
        where: { id: order.id },
        data: { 
          items: JSON.stringify(items),
          status: newOrderStatus
        }
      })

      return NextResponse.json({ success: true, newStatus: nextStatus.replace(/_/g, ' ') })

    } else {
      // Legacy order-level tracking (if an old QR code is scanned or short ID is manually typed)
      const currentStatus = order.status
      const allowedTransitions = DEPARTMENT_TRANSITIONS[department]

      if (!allowedTransitions || !allowedTransitions.includes(currentStatus)) {
        return NextResponse.json({ error: `Department '${department}' cannot scan order currently in '${currentStatus.replace(/_/g, ' ')}' status.` }, { status: 400 })
      }

      const currentIndex = PIPELINE.indexOf(currentStatus)
      const nextStatus = PIPELINE[currentIndex + 1]

      if (!nextStatus) {
        return NextResponse.json({ error: 'Order is already fully processed' }, { status: 400 })
      }

      // Initialize all pieces to this new status so the data stays in sync
      items.forEach((i: any) => {
        const qty = Number(i.quantity) || 1
        i.piece_statuses = Array(qty).fill(nextStatus)
      })

      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: nextStatus,
          items: JSON.stringify(items)
        }
      })

      return NextResponse.json({ success: true, newStatus: nextStatus.replace(/_/g, ' ') })
    }

  } catch (error: any) {
    console.error('Scan error:', error)
    return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 })
  }
}
