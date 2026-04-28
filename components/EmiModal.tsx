import { X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface EmiModalProps {
  isOpen: boolean
  onClose: () => void
  price: number
}

const banks = [
  { name: 'HDFC Bank', rate: 15 },
  { name: 'ICICI Bank', rate: 14.5 },
  { name: 'State Bank of India', rate: 14.75 },
  { name: 'Axis Bank', rate: 15 },
  { name: 'Bajaj Finserv (No Cost)', rate: 0 },
]

export default function EmiModal({ isOpen, onClose, price }: EmiModalProps) {
  if (!isOpen) return null

  const calculateEMI = (price: number, months: number, rate: number) => {
    if (rate === 0) return Math.round(price / months)
    const r = rate / 12 / 100
    return Math.round((price * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-luxury shadow-luxury-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-2xl font-playfair font-bold text-emerald">EMI Options</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6">
          <p className="font-montserrat text-gray-600 mb-6 text-sm">
            Estimated EMI on {formatPrice(price)}. Actual EMI may vary based on bank terms and GST.
          </p>
          <div className="space-y-8">
            {banks.map(bank => (
              <div key={bank.name}>
                <h3 className="font-montserrat font-bold text-gray-800 mb-3">{bank.name}</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left font-montserrat text-sm border-collapse">
                     <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="p-3 border-b border-gray-200 font-semibold">Tenure</th>
                          <th className="p-3 border-b border-gray-200 font-semibold">Interest Rate (p.a)</th>
                          <th className="p-3 border-b border-gray-200 font-semibold text-right">EMI Amount</th>
                        </tr>
                     </thead>
                     <tbody>
                        {[3, 6, 9, 12, 18, 24].map((months) => {
                          if (bank.rate === 0 && months > 6) return null; // Bajaj No Cost only up to 6mo
                          return (
                            <tr key={months} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                              <td className="p-3">{months} Months</td>
                              <td className="p-3">{bank.rate === 0 ? '0% (No Cost EMI)' : `${bank.rate}%`}</td>
                              <td className="p-3 text-right font-semibold text-charcoal">{formatPrice(calculateEMI(price, months, bank.rate))}</td>
                            </tr>
                          )
                        })}
                     </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
