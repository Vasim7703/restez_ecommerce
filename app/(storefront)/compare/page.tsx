'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCompareStore, useCartStore } from '@/lib/store'
import { X, ArrowRight, Check, ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function ComparePage() {
  const { items, removeFromCompare, clearCompare } = useCompareStore()
  const addToCart = useCartStore(state => state.addToCart)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-3xl font-playfair font-bold text-emerald mb-4">Compare Products</h1>
        <p className="text-gray-600 font-montserrat mb-8 text-center">You haven't added any products to compare yet.</p>
        <Link href="/products" className="bg-emerald text-white px-8 py-3 rounded-luxury font-montserrat font-semibold hover:bg-emerald-light transition-colors">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-playfair font-bold text-emerald">Compare Products</h1>
            <p className="text-gray-600 font-montserrat mt-2">Side-by-side comparison of your selected items.</p>
          </div>
          <button onClick={clearCompare} className="mt-4 sm:mt-0 text-red-500 font-montserrat text-sm font-semibold hover:underline">
            Clear all
          </button>
        </div>

        <div className="overflow-x-auto pb-8">
          <table className="w-full min-w-[800px] border-collapse bg-white shadow-luxury rounded-luxury overflow-hidden">
            <thead>
              <tr>
                <th className="p-6 text-left border-b border-gray-200 border-r w-1/4 bg-gray-50">
                   <p className="font-playfair text-lg text-charcoal">Specs / Products</p>
                </th>
                {items.map(product => (
                  <th key={product.id} className="p-6 text-center border-b border-gray-200 w-1/4 relative group">
                    <button 
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-4 right-4 p-1.5 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="aspect-[4/3] w-full bg-cover bg-center rounded-luxury mb-4" style={{ backgroundImage: `url(${product.images.main})` }} />
                    <Link href={`/products/${product.slug}`} className="font-playfair text-xl font-bold text-charcoal hover:text-emerald transition-colors line-clamp-2">
                       {product.name}
                    </Link>
                    <p className="text-2xl text-emerald font-bold mt-2 font-playfair">{formatPrice(product.base_price)}</p>
                    
                    <button 
                      onClick={() => addToCart({ product, quantity: 1, selected_fabric: product.fabric_options.standard[0], fabric_type: 'standard', total_price: product.base_price })}
                      className="mt-4 w-full flex items-center justify-center space-x-2 bg-emerald hover:bg-emerald-light text-white py-2 rounded font-montserrat font-semibold transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  </th>
                ))}
                {/* Empty slots if less than 3 */}
                {Array.from({ length: 3 - items.length }).map((_, i) => (
                  <th key={`empty-${i}`} className="p-6 border-b border-gray-200 w-1/4 bg-gray-50/50">
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                       <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                          <span className="text-2xl text-gray-300">+</span>
                       </div>
                       <p className="font-montserrat text-sm text-gray-500">Add an item to compare</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-montserrat text-sm text-gray-700">
              <tr>
                <td className="p-4 font-semibold border-b border-r border-gray-100 bg-gray-50">Collection</td>
                {items.map(p => <td key={p.id} className="p-4 border-b border-gray-100 text-center">{p.collection}</td>)}
                {Array.from({ length: 3 - items.length }).map((_, i) => <td key={`e1-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/50" />)}
              </tr>
              <tr>
                <td className="p-4 font-semibold border-b border-r border-gray-100 bg-gray-50">Material</td>
                {items.map(p => <td key={p.id} className="p-4 border-b border-gray-100 text-center font-medium">{p.material}</td>)}
                {Array.from({ length: 3 - items.length }).map((_, i) => <td key={`e2-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/50" />)}
              </tr>
              <tr>
                <td className="p-4 font-semibold border-b border-r border-gray-100 bg-gray-50">Style</td>
                {items.map(p => <td key={p.id} className="p-4 border-b border-gray-100 text-center">{p.style}</td>)}
                {Array.from({ length: 3 - items.length }).map((_, i) => <td key={`e3-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/50" />)}
              </tr>
              <tr>
                <td className="p-4 font-semibold border-b border-r border-gray-100 bg-gray-50">Seating Capacity</td>
                {items.map(p => <td key={p.id} className="p-4 border-b border-gray-100 text-center">{p.seating_capacity} Seater</td>)}
                {Array.from({ length: 3 - items.length }).map((_, i) => <td key={`e4-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/50" />)}
              </tr>
              <tr>
                <td className="p-4 font-semibold border-b border-r border-gray-100 bg-gray-50">Dimensions (L×W×H)</td>
                {items.map(p => <td key={p.id} className="p-4 border-b border-gray-100 text-center">{p.dimensions.length}cm × {p.dimensions.width}cm × {p.dimensions.height}cm</td>)}
                {Array.from({ length: 3 - items.length }).map((_, i) => <td key={`e5-${i}`} className="p-4 border-b border-gray-100 bg-gray-50/50" />)}
              </tr>
              <tr>
                <td className="p-4 font-semibold border-r border-gray-100 bg-gray-50">Standard Fabrics</td>
                {items.map(p => (
                  <td key={p.id} className="p-4 border-gray-100 text-center">
                    <ul className="space-y-1">
                      {p.fabric_options.standard.map(f => <li key={f}>• {f}</li>)}
                    </ul>
                  </td>
                ))}
                {Array.from({ length: 3 - items.length }).map((_, i) => <td key={`e6-${i}`} className="p-4 border-gray-100 bg-gray-50/50" />)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
