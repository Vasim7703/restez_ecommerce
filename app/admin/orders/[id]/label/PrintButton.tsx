'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="flex items-center space-x-2 bg-charcoal hover:bg-black text-white px-6 py-3 rounded-luxury font-montserrat font-semibold transition-all shadow-md"
    >
      <Printer className="w-5 h-5" />
      <span>Print Label</span>
    </button>
  )
}
