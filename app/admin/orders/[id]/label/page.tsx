import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import PrintButton from './PrintButton'
import { QRCodeSVG } from 'qrcode.react'

const prisma = new PrismaClient()

export default async function LabelPrintPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ dest?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!order) {
    return notFound()
  }

  // Auto-advance status from pending to carcass_manufacturing upon printing the label
  if (order.status === 'pending') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'carcass_manufacturing' }
    })
    order.status = 'carcass_manufacturing'
  }

  const items = JSON.parse(order.items || '[]')
  const address = JSON.parse(order.address || '{}')

  // Fetch product details to map product names and materials
  const productIds = items.map((i: any) => i.productId).filter(Boolean)
  if (productIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })
    items.forEach((i: any) => {
      i.product = products.find((p) => p.id === i.productId)
    })
  }

  // Expand items based on quantity so each piece gets its own label
  const expandedItems: any[] = []
  items.forEach((item: any, originalIndex: number) => {
    const qty = Number(item.quantity) || 1
    for (let i = 0; i < qty; i++) {
      expandedItems.push({ ...item, itemIndex: originalIndex, pieceIndex: i, totalQty: qty })
    }
  })

  // Base URL for worker scanning
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 print:p-0 print:bg-white print:m-0">
      
      {/* Controls */}
      <div className="w-full max-w-[4in] flex justify-between items-center mb-8 px-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Print 4x3 Label</h1>
        </div>
        <PrintButton />
      </div>

      <div className="flex flex-col gap-8 print:gap-0">
        {expandedItems.map((item, index) => {
          let parsedDims = null
          if (item.product?.dimensions) {
            try {
              parsedDims = JSON.parse(item.product.dimensions)
            } catch(e) {
              // Ignore
            }
          }

          return (
            <div key={index} className="bg-white shadow-2xl w-[4in] h-[3in] print:shadow-none print:w-[4in] print:h-[3in] print:m-0 overflow-hidden relative font-sans text-black border border-gray-200 print:border-none p-4 flex flex-col justify-between" style={{ pageBreakAfter: 'always' }}>
              
              {/* Dynamic Routing Destination Banner */}
              {resolvedSearchParams.dest && (
                <div className="bg-black text-white text-center py-1.5 -mx-4 -mt-4 mb-2">
                  <h2 className="text-xl font-black uppercase tracking-widest leading-none">
                    ROUTE TO: {resolvedSearchParams.dest.replace(/_/g, ' ')}
                  </h2>
                </div>
              )}

              {/* Top Header - Customer & Order ID */}
              <div className="flex justify-between items-start border-b border-black pb-2 mb-2">
                <div className="w-2/3">
                  <h2 className="text-xl font-bold leading-tight line-clamp-1">{order.customer_name}</h2>
                  <p className="text-sm font-medium leading-none mt-1">{address.city}, {address.state}</p>
                </div>
                <div className="text-right w-1/3">
                  <p className="font-mono text-lg font-black tracking-tighter text-right">{order.id.slice(-8).toUpperCase()}-{item.itemIndex}-{item.pieceIndex}</p>
                  <p className="text-[10px] font-bold mt-1">ITEM: {index + 1}/{expandedItems.length}</p>
                </div>
              </div>

              {/* Main Body - Item Details & QR Code */}
              <div className="flex flex-row justify-between items-center flex-1 h-full">
                {/* Item Details */}
                <div className="flex-1 pr-2 flex flex-col h-full justify-start pt-1">
                  <div className="mb-2 text-xs leading-snug">
                    <h3 className="font-bold text-sm leading-tight line-clamp-2">
                      {item.product?.name || item.name || 'Unknown Product'}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="font-bold bg-black text-white px-1 py-0.5 rounded-sm uppercase text-[10px]">
                        FABRIC: {item.fabric_type || item.fabric || 'Standard'}
                      </span>
                      {item.product?.material && (
                        <span className="font-bold border border-black text-black px-1 py-0.5 rounded-sm uppercase text-[10px]">
                          {item.product.material}
                        </span>
                      )}
                      {parsedDims && (
                        <span className="font-bold border border-black text-black px-1 py-0.5 rounded-sm uppercase text-[10px]">
                          DIM: {parsedDims.length}"L x {parsedDims.width}"W x {parsedDims.height}"H
                        </span>
                      )}
                      {item.color && (
                        <span className="font-bold bg-gray-200 text-black px-1 py-0.5 rounded-sm uppercase text-[10px]">
                          {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className="font-bold border border-black text-black px-1 py-0.5 rounded-sm uppercase text-[10px]">
                          {item.size}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <QRCodeSVG 
                    value={`${baseUrl}/worker/scan?orderId=${order.id}&item=${item.itemIndex}&piece=${item.pieceIndex}`} 
                    size={110} 
                    level="M" 
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-black pt-1 mt-1 text-center">
                 <p className="text-[10px] font-bold tracking-widest uppercase">SCAN TO UPDATE STATUS</p>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
