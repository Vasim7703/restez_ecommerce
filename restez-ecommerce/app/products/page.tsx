'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { useFilterStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { mockProducts } from '@/lib/mockData'

export default function ProductsPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
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

  // Filter products
  const filteredProducts = mockProducts.filter((product) => {
    const priceMatch = product.base_price >= priceRange[0] && product.base_price <= priceRange[1]
    const materialMatch = materials.length === 0 || materials.includes(product.material)
    const seatingMatch = seatingCapacity.length === 0 || seatingCapacity.includes(product.seating_capacity)
    const styleMatch = styles.length === 0 || styles.includes(product.style)
    
    return priceMatch && materialMatch && seatingMatch && styleMatch
  })

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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block bg-white rounded-luxury shadow-md hover:shadow-luxury-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url(${product.images.main})` }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-playfair font-bold text-charcoal group-hover:text-emerald transition-colors line-clamp-2">
                          {product.name}
                        </h3>
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
                </motion.div>
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
    </div>
  )
}
