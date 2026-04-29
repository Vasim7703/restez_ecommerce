import { useState } from 'react'
import { X, Ruler, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface Dimensions {
  length: number
  width: number
  height: number
}

interface WillItFitModalProps {
  isOpen: boolean
  onClose: () => void
  productDimensions: Dimensions
  productName: string
}

export default function WillItFitModal({ isOpen, onClose, productDimensions, productName }: WillItFitModalProps) {
  const [doorWidth, setDoorWidth] = useState('')
  const [doorHeight, setDoorHeight] = useState('')
  const [status, setStatus] = useState<'pass' | 'fail' | 'tight' | null>(null)

  if (!isOpen) return null

  const checkFit = () => {
    const dW = parseFloat(doorWidth)
    const dH = parseFloat(doorHeight)
    if (!dW || !dH) return

    // Minimal logic: sofa can go in upright or diagonally.
    // The shortest dimension of the sofa must be less than the door width.
    const dimensions = [productDimensions.length, productDimensions.width, productDimensions.height].sort((a,b) => a - b)
    const shortestSide = dimensions[0]
    const middleSide = dimensions[1]

    if (shortestSide < dW - 5 && middleSide < dH - 5) {
      setStatus('pass')
    } else if (shortestSide <= dW + 2 && middleSide <= dH + 2) {
      setStatus('tight')
    } else {
      setStatus('fail')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-luxury shadow-luxury-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-emerald text-white rounded-t-luxury">
          <h2 className="text-xl font-playfair font-bold flex items-center gap-2"><Ruler className="w-5 h-5"/> Will It Fit?</h2>
          <button onClick={onClose} className="p-2 hover:bg-emerald-light rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="p-6">
          <p className="text-sm font-montserrat text-gray-600 mb-6">
            Check if the <strong>{productName}</strong> ({productDimensions.length}L × {productDimensions.width}W × {productDimensions.height}H cm) will pass through your tightest doorway, elevator, or stairwell.
          </p>

          <div className="space-y-4 mb-6">
            <div>
               <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-1">Tightest Door Width (cm)</label>
               <input type="number" placeholder="e.g. 85" className="w-full border border-gray-300 rounded px-4 py-2 font-montserrat focus:ring-emerald focus:border-emerald" value={doorWidth} onChange={e => setDoorWidth(e.target.value)} />
            </div>
            <div>
               <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-1">Tightest Door Height (cm)</label>
               <input type="number" placeholder="e.g. 210" className="w-full border border-gray-300 rounded px-4 py-2 font-montserrat focus:ring-emerald focus:border-emerald" value={doorHeight} onChange={e => setDoorHeight(e.target.value)} />
            </div>
          </div>

          <button onClick={checkFit} disabled={!doorWidth || !doorHeight} className="w-full py-3 bg-gold hover:bg-gold-light text-white rounded font-montserrat font-semibold transition-colors disabled:opacity-50">
            Check Fit
          </button>

          {status === 'pass' && (
            <div className="mt-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded flex gap-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0 text-green-600" />
              <div>
                <p className="font-semibold font-playfair text-lg">Great News!</p>
                <p className="text-sm font-montserrat mt-1">Based on your measurements, this sofa should easily fit through your doorway.</p>
              </div>
            </div>
          )}

          {status === 'tight' && (
            <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded flex gap-3">
              <Info className="w-6 h-6 flex-shrink-0 text-yellow-600" />
              <div>
                <p className="font-semibold font-playfair text-lg">It&apos;s a tight squeeze</p>
                <p className="text-sm font-montserrat mt-1">It might fit through diagonally or with minor maneuvering. Our delivery team will assess upon arrival.</p>
              </div>
            </div>
          )}

          {status === 'fail' && (
            <div className="mt-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded flex gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-600" />
              <div>
                <p className="font-semibold font-playfair text-lg">Warning: Likely Won&apos;t Fit</p>
                <p className="text-sm font-montserrat mt-1">The dimensions suggest this may not pass through comfortably. Consider requesting a site survey before ordering.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
