'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plus, Trash2, Check, Star } from 'lucide-react'
import { useUserMetaStore } from '@/lib/store'

export default function AddressesPage() {
  const { addresses, addAddress, removeAddress, setDefaultAddress } = useUserMetaStore()
  const [mounted, setMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  
  const [newAddr, setNewAddr] = useState({
    name: '', phone: '', street: '', city: '', state: '', pincode: '', is_default: false
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald bg-white transition-all'
  const labelCls = 'block text-xs font-montserrat font-semibold text-gray-600 mb-1.5'

  const isValid = newAddr.name && newAddr.phone.length >= 10 && newAddr.street && newAddr.city && newAddr.state && newAddr.pincode.length === 6

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    addAddress(newAddr)
    setNewAddr({ name: '', phone: '', street: '', city: '', state: '', pincode: '', is_default: false })
    setIsAdding(false)
  }

  return (
    <div>
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-charcoal">Saved Addresses</h2>
          <p className="text-sm font-montserrat text-gray-500 mt-1">Manage your delivery locations.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald hover:bg-emerald-light text-white rounded-luxury font-montserrat font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add New</span>
        </button>
      </div>

      <div className="p-6">
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-gray-200 p-6 rounded-luxury">
                <h3 className="text-lg font-playfair font-bold text-charcoal mb-4">Add New Address</h3>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Full Name</label>
                    <input value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} className={inputCls} placeholder="John Doe" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Street Address</label>
                    <textarea value={newAddr.street} onChange={e => setNewAddr({...newAddr, street: e.target.value})} rows={2} className={`${inputCls} resize-none`} placeholder="House No., Building, Street" />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value.replace(/\D/g,'').slice(0,10)})} className={inputCls} placeholder="10-digit mobile" />
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <input value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} className={inputCls} placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <select value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} className={inputCls}>
                      <option value="">Select State</option>
                      {['Maharashtra','Delhi','Karnataka','Tamil Nadu','Gujarat'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Pincode</label>
                    <input value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value.replace(/\D/,'').slice(0,6)})} className={inputCls} placeholder="6 digits" />
                  </div>
                  <div className="md:col-span-2 flex items-center space-x-2 mt-2">
                    <input type="checkbox" id="defaultAddr" checked={newAddr.is_default} onChange={e => setNewAddr({...newAddr, is_default: e.target.checked})} className="w-4 h-4 text-emerald rounded border-gray-300 focus:ring-emerald" />
                    <label htmlFor="defaultAddr" className="text-sm font-montserrat text-gray-700">Set as default delivery address</label>
                  </div>
                  <div className="md:col-span-2 flex space-x-3 mt-4">
                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-luxury font-montserrat font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={!isValid} className="flex-1 px-4 py-3 bg-charcoal text-white rounded-luxury font-montserrat font-semibold disabled:opacity-50 transition-colors hover:bg-black">Save Address</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {addresses.length === 0 && !isAdding ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-playfair font-bold text-xl text-charcoal mb-2">No addresses saved</h3>
            <p className="text-gray-500 font-montserrat text-sm mb-6">Add an address so we can deliver your luxury pieces.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-2 border-2 border-emerald text-emerald hover:bg-emerald hover:text-white rounded-luxury font-montserrat font-semibold transition-colors"
            >
              Add First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(addr => (
              <div key={addr.id} className={`border p-6 rounded-luxury relative transition-colors ${addr.is_default ? 'border-emerald bg-emerald/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                {addr.is_default && (
                  <span className="absolute top-4 right-4 text-xs font-montserrat font-bold bg-emerald text-white px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Default</span>
                  </span>
                )}
                <h4 className="font-montserrat font-bold text-charcoal mb-1">{addr.name}</h4>
                <p className="text-sm font-montserrat text-gray-600 mb-4">{addr.phone}</p>
                <div className="text-sm font-montserrat text-gray-500 space-y-1 mb-6">
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.pincode}</p>
                </div>
                
                <div className="flex space-x-3 border-t border-gray-100 pt-4 mt-auto">
                  {!addr.is_default && (
                    <button 
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-xs font-montserrat font-semibold text-emerald hover:text-emerald-light transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Make Default</span>
                    </button>
                  )}
                  <button 
                    onClick={() => removeAddress(addr.id)}
                    className="text-xs font-montserrat font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center space-x-1 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
