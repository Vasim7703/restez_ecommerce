'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { useFilterStore, useCompareStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/lib/supabase'

// Dot colours for fabric name → swatch dot background colour
const FABRIC_DOT: Record<string, string> = {
  'emerald': '#1a6b4a', 'forest': '#2d6a4f',
  'burgundy': '#7c1f38', 'maroon': '#6b1f2a', 'wine': '#7c1f38',
  'navy': '#1a2f6b', 'blue': '#1e3a8a', 'peacock': '#005f73',
  'gold': '#b5860d', 'mustard': '#c19a1f', 'antique gold': '#b8860b',
  'charcoal': '#3d3d3d', 'grey': '#6b7280', 'gray': '#6b7280',
  'ivory': '#f5f0e8', 'cream': '#fffdd0', 'white': '#f9f9f9',
  'terracotta': '#c1440e', 'rust': '#b7410e', 'orange': '#ea580c',
  'purple': '#6b21a8', 'violet': '#7c3aed', 'royal purple': '#581c87',
  'blush': '#e8a5a5', 'rose': '#f43f5e', 'pink': '#ec4899',
  'black': '#1c1c1c',
}

function getFabricDotColor(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, color] of Object.entries(FABRIC_DOT)) {
    if (lower.includes(key)) return color
  }
  return '#d1d5db'
}

function FabricCardImage({ product }: { product: Product }) {
  const fabricEntries = Object.entries(product.fabric_images || {})
  const [hovered, setHovered] = useState<string | null>(null)
  const displayImg = (hovered && product.fabric_images[hovered]) || product.images.main

  return (
    <>
      <div
        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-all duration-500"
        style={{ backgroundImage: `url(${displayImg})` }}
      />
      {fabricEntries.length > 0 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {fabricEntries.map(([name]) => (
            <button
              key={name}
              title={name}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 shadow-md"
              style={{
                backgroundColor: getFabricDotColor(name),
                borderColor: hovered === name ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [expandedFilters, setExpandedFilters] = useState({

    price: true,
    material: true,
    seating: true,
    style: true,
  })

  const {
    priceRange,
    materials,
    seatingCapacity,
    styles,
    setPriceRange,
    toggleMaterial,
    toggleSeatingCapacity,
    toggleStyle,
    clearFilters,
  } = useFilterStore()

  const { items: compareItems, addToCompare, removeFromCompare, isInCompare } = useCompareStore()

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
  const filteredProducts = products.filter((product) => {
    const priceMatch = product.base_price >= priceRange[0] && product.base_price <= priceRange[1]
    const materialMatch = materials.length === 0 || materials.includes(product.material)
    const seatingMatch = seatingCapacity.length === 0 || seatingCapacity.includes(product.seating_capacity)
    const styleMatch = styles.length === 0 || styles.includes(product.style)
    const categoryMatch = activeCategory === 'All' || product.category === activeCategory
    return priceMatch && materialMatch && seatingMatch && styleMatch && categoryMatch
  })

  // Unique categories from all fetched products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category))).sort()]

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const key = product.collection || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(product)
    return acc
  }, {} as Record<string, typeof filteredProducts>)

  const toggleFilterSection = (section: keyof typeof expandedFilters) => {
    setExpandedFilters({ ...expandedFilters, [section]: !expandedFilters[section] })
  }

  const FilterSection = ({
    title,
    section,
    children,
  }: {
    title: string
    section: keyof typeof expandedFilters
    children: React.ReactNode
  }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleFilterSection(section)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-montserrat font-semibold text-charcoal">{title}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            expandedFilters[section] ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expandedFilters[section] && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  )

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-playfair font-bold text-emerald">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-gold hover:text-gold-dark font-montserrat font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range" section="price">
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="500000"
            step="10000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full accent-emerald"
          />
          <div className="flex items-center justify-between text-sm font-montserrat">
            <span className="text-gray-600">{formatPrice(priceRange[0])}</span>
            <span className="text-emerald font-semibold">{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </FilterSection>

      {/* Material */}
      <FilterSection title="Material" section="material">
        {['Teak Wood', 'Sheesham Wood', 'Mango Wood'].map((material) => (
          <label key={material} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={materials.includes(material)}
              onChange={() => toggleMaterial(material)}
              className="w-4 h-4 accent-emerald cursor-pointer"
            />
            <span className="text-sm font-montserrat text-gray-700 group-hover:text-emerald">
              {material}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Seating Capacity */}
      <FilterSection title="Seating Capacity" section="seating">
        {[1, 2, 3, 5, 6].map((capacity) => (
          <label key={capacity} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={seatingCapacity.includes(capacity)}
              onChange={() => toggleSeatingCapacity(capacity)}
              className="w-4 h-4 accent-emerald cursor-pointer"
            />
            <span className="text-sm font-montserrat text-gray-700 group-hover:text-emerald">
              {capacity === 5 || capacity === 6 ? `${capacity}+ Seater (L-Shape)` : `${capacity} Seater`}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Style */}
      <FilterSection title="Style" section="style">
        {['Traditional', 'Modern', 'Contemporary', 'Classic'].map((style) => (
          <label key={style} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={styles.includes(style)}
              onChange={() => toggleStyle(style)}
              className="w-4 h-4 accent-emerald cursor-pointer"
            />
            <span className="text-sm font-montserrat text-gray-700 group-hover:text-emerald">
              {style}
            </span>
          </label>
        ))}
      </FilterSection>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-emerald text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-jali-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-3">
            Our Collections
          </h1>
          <p className="text-lg font-montserrat text-gold">
            Discover handcrafted luxury sofas for your home
          </p>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
          <p className="text-xl font-playfair text-charcoal">Loading Our Exquisite Collection...</p>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white p-6 rounded-luxury shadow-luxury">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center space-x-2 bg-white px-4 py-3 rounded-luxury shadow-md border border-gray-200 font-montserrat font-medium text-charcoal"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Mobile Filter Modal */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-playfair font-bold text-emerald">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                <FilterSidebar />
              </motion.div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Category Tab Bar */}
            <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full font-montserrat font-semibold text-sm transition-all duration-200 border ${
                    activeCategory === cat
                      ? 'bg-emerald text-white border-emerald shadow-md'
                      : 'bg-white text-charcoal border-gray-200 hover:border-emerald hover:text-emerald'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mb-6 flex items-center justify-between">

              <p className="text-sm font-montserrat text-gray-600">
                Showing <span className="font-semibold text-emerald">{filteredProducts.length}</span> products
              </p>
              <select className="px-4 py-2 border border-gray-300 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>

            <div className="space-y-12">
              {Object.entries(groupedProducts).map(([collectionName, products]) => (
                <div key={collectionName} className="mb-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <h2 className="text-2xl font-playfair font-bold text-charcoal">{collectionName} Collection</h2>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                  <div className="group relative bg-white rounded-luxury shadow-md hover:shadow-luxury-lg transition-all duration-300 overflow-hidden">
                    <label className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-sm border border-gray-100 cursor-pointer hover:bg-white transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-emerald cursor-pointer" 
                        checked={isInCompare(product.id)} 
                        onChange={() => isInCompare(product.id) ? removeFromCompare(product.id) : compareItems.length < 3 ? addToCompare(product) : alert('You can only compare up to 3 items')} 
                      />
                      <span className="text-xs font-montserrat font-semibold text-charcoal">Compare</span>
                    </label>
                    <Link
                      href={`/products/${product.slug}`}
                      className="block"
                    >
                    {/* Image with fabric swatch hover */}
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative group/img">
                      <FabricCardImage product={product} />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-lg font-playfair font-bold text-charcoal group-hover:text-emerald transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="px-2 py-0.5 bg-emerald/10 text-emerald text-xs font-montserrat font-semibold rounded-full">{product.category}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-montserrat rounded-full">{product.style}</span>
                      </div>

                      <p className="text-sm text-gray-600 font-montserrat mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-playfair font-bold text-emerald">
                            {formatPrice(product.base_price)}
                          </p>
                          <p className="text-xs text-gray-500 font-montserrat">
                            {product.seating_capacity} Seater • {product.material}
                          </p>
                        </div>

                        {product.in_stock ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-montserrat font-semibold rounded-full">
                            In Stock
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-montserrat font-semibold rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                    </Link>
                  </div>
                </motion.div>
              ))}
              </div>
            </div>
          ))}
          </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl font-playfair text-gray-500 mb-4">
                  No products match your filters
                </p>
                <button
                  onClick={clearFilters}
                  className="text-gold hover:text-gold-dark font-montserrat font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {compareItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] p-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h4 className="font-playfair font-bold text-lg text-emerald hidden sm:block">Compare ({compareItems.length}/3)</h4>
              <div className="flex space-x-3">
                {compareItems.map(item => (
                  <div key={item.id} className="relative w-12 h-12 rounded border border-gray-200 bg-cover bg-center" style={{ backgroundImage: `url(${item.images.main})` }}>
                    <button onClick={() => removeFromCompare(item.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-4">
              <button onClick={() => { compareItems.forEach(i => removeFromCompare(i.id)) }} className="text-gray-500 text-sm font-semibold hover:text-red-500 transition-colors">Clear All</button>
              <Link href="/compare" className="bg-emerald text-white px-6 py-2 rounded-luxury font-semibold font-montserrat shadow-luxury transition-all hover:bg-emerald-light pointer-events-auto cursor-pointer">
                Compare Products
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
