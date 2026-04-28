'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertTriangle, LogOut } from 'lucide-react'

import { Scanner } from '@yudiel/react-qr-scanner'

export default function WorkerScan() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [department, setDepartment] = useState<string | null>(null)
  
  const [orderId, setOrderId] = useState('')
  const [itemIndex, setItemIndex] = useState<string | null>(null)
  const [pieceIndex, setPieceIndex] = useState<string | null>(null)

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check auth cookie
    const match = document.cookie.match(new RegExp('(^| )worker_dept=([^;]+)'))
    if (match) {
      setDepartment(match[2])
    } else {
      router.push('/worker/login')
    }

    // Check if opened via QR code scan (URL has ?orderId=...)
    const scannedOrderId = searchParams.get('orderId')
    if (scannedOrderId) {
      setOrderId(scannedOrderId)
      const scannedItem = searchParams.get('item')
      const scannedPiece = searchParams.get('piece')
      if (scannedItem) setItemIndex(scannedItem)
      if (scannedPiece) setPieceIndex(scannedPiece)
    }
  }, [router, searchParams])

  const [selectedDest, setSelectedDest] = useState('polish')
  
  const handleUpdate = async (e?: React.FormEvent, overrideId?: string, overrideItem?: string | null, overridePiece?: string | null) => {
    if (e) e.preventDefault()
    
    let targetId = overrideId || orderId
    let targetItem = overrideItem !== undefined ? overrideItem : itemIndex
    let targetPiece = overridePiece !== undefined ? overridePiece : pieceIndex

    // Handle manual entry with hyphen (e.g. 8F7A9B2C-0-1)
    if (targetId && targetId.includes('-')) {
      const parts = targetId.split('-')
      if (parts.length === 3) {
        targetId = parts[0]
        targetItem = parts[1]
        targetPiece = parts[2]
      } else if (parts.length === 2) {
        targetId = parts[0]
        targetItem = parts[1]
        targetPiece = "0" // Default to piece 0 if only item is specified
      }
    }

    if (!targetId) return

    setStatus('loading')
    try {
      const payload: any = { orderId: targetId, department }
      if (targetItem !== null && targetPiece !== null) {
        payload.itemIndex = Number(targetItem)
        payload.pieceIndex = Number(targetPiece)
      }

      const res = await fetch('/api/worker/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        const pieceMsg = (targetItem !== null && targetPiece !== null) ? ` (Piece ${Number(targetPiece)+1})` : ''
        setMessage(`Status updated to: ${data.newStatus}${pieceMsg}`)
        // Set a smart default for the next department based on what we just updated to
        const nextMap: Record<string, string> = {
          'carcass_manufacturing': 'polish',
          'carcass_done': 'polish',
          'polish': 'foaming',
          'polish_done': 'foaming',
          'foaming': 'upholstry',
          'foaming_done': 'upholstry',
          'upholstry': 'qc',
          'upholstry_done': 'qc',
          'ready_for_qc': 'packing',
          'qc_done': 'packing',
          'packing': 'dispatch',
          'packing_done': 'dispatch'
        }
        setSelectedDest(nextMap[data.newStatus.replace(/ /g, '_').toLowerCase()] || 'dispatch')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to update order')
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      try {
        const raw = detectedCodes[0].rawValue
        if (typeof raw === 'string') {
          if (raw.includes('orderId=')) {
            const url = new URL(raw)
            const id = url.searchParams.get('orderId')
            const item = url.searchParams.get('item')
            const piece = url.searchParams.get('piece')
            
            if (id) {
               setOrderId(id)
               if (item) setItemIndex(item)
               if (piece) setPieceIndex(piece)
               
               // Only trigger update if it's a new scan
               if (id !== orderId || item !== itemIndex || piece !== pieceIndex) {
                 handleUpdate(undefined, id, item, piece)
               }
            }
          } else {
            if (raw !== orderId) {
               setOrderId(raw)
               setItemIndex(null)
               setPieceIndex(null)
               handleUpdate(undefined, raw, null, null)
            }
          }
        }
      } catch (err) {
        // Handle gracefully
      }
    }
  }

  const handleLogout = () => {
    document.cookie = 'worker_dept=; Max-Age=-99999999;'
    router.push('/worker/login')
  }

  const resetScan = () => {
    setOrderId('')
    setStatus('idle')
    router.replace('/worker/scan')
  }

  const printRoutingLabel = () => {
    // Open print page with destination in new tab
    window.open(`/admin/orders/${orderId}/label?dest=${selectedDest}`, '_blank')
    // Reset scanner
    resetScan()
  }

  if (!department) return null // loading or redirecting

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      
      <div className="absolute top-4 right-4">
        <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 bg-white px-4 py-2 rounded-full shadow-sm">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-semibold font-montserrat">Sign Out</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <div className="inline-block px-4 py-1 bg-emerald/10 text-emerald rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          {department.replace(/_/g, ' ')} Dept
        </div>
        
        <h1 className="text-2xl font-playfair font-bold text-charcoal mb-2">Scan Order</h1>
        <p className="text-gray-500 font-montserrat text-sm mb-8">Scan QR code using your phone camera, or manually enter the Order ID below.</p>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl mb-6 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 mb-2" />
            <p className="font-bold mb-6">{message}</p>
            
            <div className="flex w-full space-x-2 mt-6">
              <button 
                onClick={resetScan}
                className="w-full bg-charcoal text-white font-bold py-4 rounded-xl text-lg hover:bg-black transition-colors"
              >
                Next Scan
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-6 flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 mb-2" />
            <p className="font-bold">{message}</p>
            <button onClick={() => setStatus('idle')} className="mt-4 text-sm underline">Try Again</button>
          </div>
        )}

        {status !== 'success' && status !== 'error' && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <Scanner 
                onScan={handleScan} 
                formats={['qr_code']}
                components={{ finder: false }}
              />
            </div>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-semibold uppercase">Or Enter Manually</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID / USB Scan"
                className="w-full text-center px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-emerald"
                required
              />
              
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-charcoal hover:bg-black text-white font-bold py-4 rounded-xl font-montserrat transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Processing...' : 'Update Status'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
