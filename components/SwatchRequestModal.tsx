import { useState } from 'react'
import { X, Scissors, Check } from 'lucide-react'

interface SwatchRequestModalProps {
  isOpen: boolean
  onClose: () => void
  availableFabrics: string[]
}

export default function SwatchRequestModal({ isOpen, onClose, availableFabrics }: SwatchRequestModalProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [address, setAddress] = useState('')

  if (!isOpen) return null

  const toggle = (f: string) => {
    if (selected.includes(f)) setSelected(selected.filter(x => x !== f))
    else if (selected.length < 3) setSelected([...selected, f])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-luxury shadow-luxury-lg w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-playfair font-bold text-charcoal mb-2">Swatches Requested!</h2>
        <p className="text-gray-600 font-montserrat text-sm mb-6">Your selected fabric samples will be dispatched via express courier. A tracking link will be sent to your registered email.</p>
        <button onClick={onClose} className="bg-emerald text-white px-8 py-3 rounded-luxury font-montserrat font-semibold transition-colors hover:bg-emerald-light">Done</button>
      </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-luxury shadow-luxury-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-luxury">
          <h2 className="text-xl font-playfair font-bold flex items-center gap-2 text-charcoal"><Scissors className="w-5 h-5"/> Request Free Swatches</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <p className="text-sm font-montserrat text-gray-600 mb-6">
            We understand the importance of texture. Choose up to 3 fabric swatches, and we will mail them to you free of charge.
          </p>

          <div className="mb-6">
            <h3 className="font-montserrat font-bold text-sm mb-3">Select Fabrics ({selected.length}/3)</h3>
            <div className="grid grid-cols-2 gap-3">
              {availableFabrics.map(f => (
                <button 
                  key={f}
                  type="button"
                  onClick={() => toggle(f)}
                  className={`p-3 text-left border rounded text-sm font-montserrat transition-all ${selected.includes(f) ? 'border-emerald bg-emerald/5 text-emerald ring-1 ring-emerald' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate pr-2">{f}</span>
                    {selected.includes(f) && <Check className="w-4 h-4 flex-shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
               <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-1">Shipping Address</label>
               <textarea required rows={3} placeholder="Full name, Street address, City, Pincode" className="w-full border border-gray-300 rounded px-4 py-2 font-montserrat text-sm focus:ring-emerald focus:border-emerald" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <button type="submit" disabled={selected.length === 0 || !address} className="w-full py-3 bg-emerald hover:bg-emerald-light text-white rounded font-montserrat font-semibold transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
              Ship Swatches <span className="text-emerald-200">{selected.length > 0 ? `(${selected.length})` : ''}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
