'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import { useWishlistStore, useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function WishlistPage() {
  const { items, toggleWishlist } = useWishlistStore()
  const addToCart = useCartStore((state) => state.addToCart)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleMoveToCart = (product: any) => {
    addToCart({
      product,
      quantity: 1,
      selected_fabric: product.fabric_options.standard[0],
      fabric_type: 'standard',
      total_price: product.base_price,
    })
    toggleWishlist(product)
    alert(`Moved ${product.name} to cart!`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-playfair font-bold text-emerald">My Wishlist</h1>
          </div>
          <p className="text-gray-500 font-montserrat">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-luxury shadow-sm p-16 text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-red-300" />
            </div>
            <h2 className="text-2xl font-playfair font-bold text-charcoal mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 font-montserrat mb-8 max-w-md mx-auto">
              Save your favorite luxury pieces here while you browse, and easily move them to your cart when you're ready.
            </p>
            <Link 
              href="/products" 
              className="inline-flex items-center space-x-2 px-8 py-4 bg-emerald hover:bg-emerald-light text-white rounded-luxury font-montserrat font-semibold transition-all shadow-luxury hover:shadow-luxury-lg"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-luxury shadow-sm border border-gray-100 overflow-hidden group flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img 
                    src={product.images.main} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {product.in_stock ? (
                    <div className="absolute bottom-3 left-3 bg-green-500/90 backdrop-blur-sm text-white text-xs font-montserrat font-bold px-2 py-1 rounded">
                      In Stock
                    </div>
                  ) : (
                    <div className="absolute bottom-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-montserrat font-bold px-2 py-1 rounded">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <Link href={`/products/${product.slug}`} className="flex-1">
                    <h3 className="font-playfair font-bold text-lg text-charcoal hover:text-emerald transition-colors line-clamp-1 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm font-montserrat text-gray-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-end justify-between mb-4">
                      <p className="text-xl font-montserrat font-bold text-emerald">
                        {formatPrice(product.base_price)}
                      </p>
                      <p className="text-xs text-gray-400 font-montserrat">
                        {product.material}
                      </p>
                    </div>
                  </Link>
                  
                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 flex gap-3">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      disabled={!product.in_stock}
                      className="flex-1 flex items-center justify-center space-x-2 bg-emerald hover:bg-emerald-light disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-luxury font-montserrat font-semibold transition-colors text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{product.in_stock ? 'Move to Cart' : 'Unavailable'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
