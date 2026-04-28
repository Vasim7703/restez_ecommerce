'use client'

import { useState } from 'react'
import { Plus, Trash2, Copy, Check } from 'lucide-react'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'FESTIVE20', discount: 20, validUntil: '2026-12-31', active: true, usedCount: 45 },
    { id: '2', code: 'WELCOME10', discount: 10, validUntil: '2027-03-31', active: true, usedCount: 123 },
  ])

  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 10, validUntil: '' })
  const [copiedCode, setCopiedCode] = useState('')

  const generateRandomCode = () => {
    const code = `RESTEZ${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    setNewCoupon({ ...newCoupon, code })
  }

  const addCoupon = () => {
    if (!newCoupon.code || !newCoupon.validUntil) {
      alert('Please fill in all fields')
      return
    }
    setCoupons([...coupons, {
      id: Date.now().toString(),
      code: newCoupon.code,
      discount: newCoupon.discount,
      validUntil: newCoupon.validUntil,
      active: true,
      usedCount: 0,
    }])
    setNewCoupon({ code: '', discount: 10, validUntil: '' })
  }

  const toggleActive = (id: string) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c))
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-emerald mb-2">Coupon Management</h1>
        <p className="text-gray-600 font-montserrat">Create and manage discount codes</p>
      </div>

      <div className="bg-white p-6 rounded-luxury shadow-md">
        <h2 className="text-xl font-playfair font-bold text-charcoal mb-4">Create New Coupon</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">Coupon Code</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="flex-1 px-4 py-2 border rounded-luxury font-montserrat focus:ring-2 focus:ring-emerald"
              />
              <button onClick={generateRandomCode} className="px-4 py-2 bg-gray-100 rounded-luxury text-sm">
                Generate
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">Discount %</label>
            <input
              type="number"
              value={newCoupon.discount}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount: parseInt(e.target.value) })}
              min="1"
              max="100"
              className="w-full px-4 py-2 border rounded-luxury focus:ring-2 focus:ring-emerald"
            />
          </div>
          <div>
            <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">Valid Until</label>
            <input
              type="date"
              value={newCoupon.validUntil}
              onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
              className="w-full px-4 py-2 border rounded-luxury focus:ring-2 focus:ring-emerald"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addCoupon}
              className="w-full bg-emerald hover:bg-emerald-light text-white px-6 py-2 rounded-luxury font-semibold flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-luxury shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-playfair font-bold text-charcoal">Existing Coupons</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold uppercase">Code</th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold uppercase">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold uppercase">Valid Until</th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold uppercase">Used</th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-montserrat font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <code className="px-3 py-1 bg-emerald/10 text-emerald font-bold rounded">{coupon.code}</code>
                      <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-gray-100 rounded">
                        {copiedCode === coupon.code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-2xl font-playfair font-bold text-gold">{coupon.discount}%</span>
                  </td>
                  <td className="px-6 py-4">{new Date(coupon.validUntil).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 font-semibold">{coupon.usedCount} times</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(coupon.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {coupon.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
