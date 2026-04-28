'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Filter, SlidersHorizontal, Search } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { Product } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<number>(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch products:", err)
        setLoading(false)
      })
  }, [])

  // Filter products
  let results = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase()) ||
    p.collection.toLowerCase().includes(query.toLowerCase())
  )

  // Apply Price Filter
  if (priceFilter === 'under50k') results = results.filter(p => p.base_price < 50000)
  if (priceFilter === '50k-100k') results = results.filter(p => p.base_price >= 50000 && p.base_price <= 100000)
  if (priceFilter === 'over100k') results = results.filter(p => p.base_price > 100000)

  // Apply Rating Filter
  if (ratingFilter > 0) {
    results = results.filter(p => {
      const avgRating = p.reviews && p.reviews.length > 0 
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
        : 0
      return avgRating >= ratingFilter
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-charcoal">
              {query ? `Results for "${query}"` : 'All Products'}
            </h1>
            <p className="text-sm font-montserrat text-gray-500 mt-1">
              Showing {results.length} results
            </p>
          </div>
          
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="mt-4 sm:mt-0 lg:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-luxury text-sm font-montserrat font-semibold text-charcoal"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
            <p className="text-xl font-playfair text-charcoal">Searching the catalog...</p>
          </div>
        ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-64 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-luxury shadow-sm space-y-8 sticky top-24">
              
              {/* Category Filter */}
              <div>
                <h3 className="font-montserrat font-bold text-charcoal mb-3 flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-emerald" />
                  <span>Price Range</span>
                </h3>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'Any Price' },
                    { id: 'under50k', label: 'Under ₹50,000' },
                    { id: '50k-100k', label: '₹50,000 - ₹1,00,000' },
                    { id: 'over100k', label: 'Over ₹1,00,000' }
                  ].map(filter => (
                    <label key={filter.id} className="flex items-center space-x-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="price"
                        checked={priceFilter === filter.id}
                        onChange={() => setPriceFilter(filter.id)}
                        className="w-4 h-4 text-emerald bg-gray-100 border-gray-300 focus:ring-emerald cursor-pointer" 
                      />
                      <span className="text-sm font-montserrat text-gray-600 group-hover:text-emerald transition-colors">{filter.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="font-montserrat font-bold text-charcoal mb-3">Customer Reviews</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(stars => (
                    <button 
                      key={stars}
                      onClick={() => setRatingFilter(ratingFilter === stars ? 0 : stars)}
                      className="flex items-center space-x-1 group w-full"
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < stars ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      <span className={`text-sm font-montserrat transition-colors ${ratingFilter === stars ? 'text-emerald font-bold' : 'text-gray-600 group-hover:text-emerald'}`}>
                        & Up
                      </span>
                    </button>
                  ))}
                  {ratingFilter > 0 && (
                    <button onClick={() => setRatingFilter(0)} className="text-xs text-red-500 font-montserrat hover:underline mt-2">
                      Clear Rating Filter
                    </button>
                  )}
                </div>
              </div>

            </div>
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product, idx) => {
                  const avgRating = product.reviews && product.reviews.length > 0 
                    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
                    : 0
                  
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-luxury shadow-sm hover:shadow-luxury-lg overflow-hidden transition-all group flex flex-col"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <img 
                          src={product.images.main} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.featured && (
                          <div className="absolute top-2 left-2 bg-gold text-white text-xs font-montserrat font-bold px-2 py-1 rounded-sm shadow-sm">
                            Best Seller
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <Link href={`/products/${product.slug}`} className="block flex-1">
                          <h3 className="font-playfair font-bold text-lg text-charcoal group-hover:text-emerald transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-1 mt-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'}`} 
                              />
                            ))}
                            <span className="text-xs text-emerald font-montserrat font-semibold ml-1">
                              {product.reviews ? product.reviews.length : 0} reviews
                            </span>
                          </div>
                          <p className="text-xl font-montserrat font-bold text-charcoal mb-1">
                            {formatPrice(product.base_price)}
                          </p>
                          <p className="text-xs font-montserrat text-gray-500 line-clamp-1">
                            {product.material} • {product.seating_capacity} Seater
                          </p>
                        </Link>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                           <p className="text-xs font-montserrat text-gray-600 mb-2">
                             FREE Delivery by <span className="font-bold text-charcoal">Tomorrow, 11 AM</span>
                           </p>
                           <Link 
                             href={`/products/${product.slug}`}
                             className="w-full block text-center px-4 py-2 bg-emerald/10 text-emerald hover:bg-emerald hover:text-white rounded-full font-montserrat font-semibold text-sm transition-colors"
                           >
                             View Details
                           </Link>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-luxury p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-playfair font-bold text-charcoal mb-2">No results found</h2>
                <p className="text-gray-500 font-montserrat">
                  Try checking your spelling or use more general terms.
                </p>
                <Link 
                  href="/products" 
                  className="inline-block mt-6 px-6 py-3 bg-emerald hover:bg-emerald-light text-white rounded-luxury font-montserrat font-semibold transition-colors"
                >
                  Browse All Collections
                </Link>
              </div>
            )}
          </main>
        </div>
        )}
        
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
