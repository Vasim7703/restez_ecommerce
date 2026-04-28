'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Share2, Truck, Shield, Star, Minus, Plus, Check, X } from 'lucide-react'
import ScrollytellingViewer from '@/components/ScrollytellingViewer'
import { useCartStore } from '@/lib/store'
import { formatPrice, validatePincode, checkPincodeServiceability } from '@/lib/utils'
import { Product, CartItem } from '@/lib/supabase'
import { mockProducts } from '@/lib/mockData'

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  
  // Find product by slug
  const product = mockProducts.find(p => p.slug === params.slug) || mockProducts[0]
  
  const [selectedFabricType, setSelectedFabricType] = useState<'standard' | 'premium'>('standard')
  const [selectedFabric, setSelectedFabric] = useState(product.fabric_options.standard[0])
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('')
  const [pincodeStatus, setPincodeStatus] = useState<{
    checking: boolean
    serviceable?: boolean
    deliveryDays?: number
  }>({ checking: false })
  const [showARViewer, setShowARViewer] = useState(false)

  const addToCart = useCartStore((state) => state.addToCart)

  const currentPrice = selectedFabricType === 'premium' 
    ? product.base_price + product.premium_upcharge 
    : product.base_price

  const scrollytellingSections = [
    {
      id: 'front',
      title: 'Front View',
      content: 'Experience the grand frontal presence of our masterpiece. Notice the intricate carved details that showcase the artisan\'s dedication to traditional craftsmanship.',
      image: product.images.front,
    },
    {
      id: 'frame',
      title: 'Frame & Material',
      content: `Constructed from premium ${product.material}, sourced from sustainable forests. Each piece of wood is carefully selected for its strength, grain pattern, and durability. Our artisans at Artech Furniture have over 20 years of woodworking expertise.`,
      image: product.images.angle_45,
    },
    {
      id: 'fabric',
      title: 'Fabric & Upholstery',
      content: 'Choose from our curated selection of fabrics. Standard options feature durable, stain-resistant materials perfect for daily use. Premium fabrics include silk blends, Italian leather, and hand-woven brocades that add unparalleled luxury.',
      image: product.images.side,
    },
    {
      id: 'dimensions',
      title: 'Dimensions & Comfort',
      content: `Perfectly sized at ${product.dimensions.length}cm (L) × ${product.dimensions.width}cm (W) × ${product.dimensions.height}cm (H). Designed ergonomically for Indian body types with high-density foam cushioning that retains shape for years.`,
      image: product.images.back,
    },
    {
      id: 'details',
      title: 'Craftsmanship Details',
      content: 'Every joint is reinforced with traditional mortise and tenon joinery. Hand-applied finishes protect the wood while highlighting its natural beauty. Brass or gold-plated accents add the perfect touch of Indian royalty.',
      image: product.images.closeup,
    },
  ]

  const handleCheckPincode = async () => {
    if (!validatePincode(pincode)) {
      alert('Please enter a valid 6-digit pincode')
      return
    }

    setPincodeStatus({ checking: true })
    const result = await checkPincodeServiceability(pincode)
    setPincodeStatus({ checking: false, ...result })
  }

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      product,
      quantity,
      selected_fabric: selectedFabric,
      fabric_type: selectedFabricType,
      total_price: currentPrice,
    }
    addToCart(cartItem)
    
    // Show success feedback
    alert('Added to cart!')
  }

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center space-x-2 text-sm font-montserrat text-gray-500">
          <button onClick={() => router.push('/')} className="hover:text-emerald">Home</button>
          <span>/</span>
          <button onClick={() => router.push('/products')} className="hover:text-emerald">Products</button>
          <span>/</span>
          <span className="text-emerald">{product.name}</span>
        </nav>
      </div>

      {/* Product Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-playfair font-bold text-emerald mb-3"
            >
              {product.name}
            </motion.h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-montserrat">
                (127 reviews)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-3 border border-gray-300 rounded-full hover:bg-emerald/5 hover:border-emerald transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 border border-gray-300 rounded-full hover:bg-emerald/5 hover:border-emerald transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <p className="mt-4 text-lg text-gray-700 font-montserrat max-w-3xl">
          {product.description}
        </p>
      </div>

      {/* Main Content: 360° Scrollytelling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollytellingViewer sections={scrollytellingSections} />
      </div>

      {/* Product Configuration Panel - Sticky on Desktop */}
      <div className="sticky bottom-0 bg-white border-t-2 border-gold/30 shadow-luxury-lg z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price */}
            <div>
              <p className="text-sm text-gray-600 font-montserrat mb-1">Price</p>
              <p className="text-3xl font-playfair font-bold text-emerald">
                {formatPrice(currentPrice)}
              </p>
              {selectedFabricType === 'premium' && (
                <p className="text-sm text-gold font-montserrat mt-1">
                  + {formatPrice(product.premium_upcharge)} for premium fabric
                </p>
              )}
            </div>

            {/* Fabric Selection */}
            <div>
              <p className="text-sm font-montserrat font-semibold text-gray-700 mb-3">
                Select Fabric Type
              </p>
              <div className="flex space-x-3 mb-4">
                <button
                  onClick={() => {
                    setSelectedFabricType('standard')
                    setSelectedFabric(product.fabric_options.standard[0])
                  }}
                  className={`px-4 py-2 rounded-luxury font-montserrat text-sm transition-all ${
                    selectedFabricType === 'standard'
                      ? 'bg-emerald text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => {
                    setSelectedFabricType('premium')
                    setSelectedFabric(product.fabric_options.premium[0])
                  }}
                  className={`px-4 py-2 rounded-luxury font-montserrat text-sm transition-all ${
                    selectedFabricType === 'premium'
                      ? 'bg-gold text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Premium
                </button>
              </div>

              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald"
              >
                {(selectedFabricType === 'standard' 
                  ? product.fabric_options.standard 
                  : product.fabric_options.premium
                ).map((fabric) => (
                  <option key={fabric} value={fabric}>
                    {fabric}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-3">
              {/* Quantity */}
              <div className="flex items-center space-x-4">
                <p className="text-sm font-montserrat font-semibold text-gray-700">
                  Quantity
                </p>
                <div className="flex items-center space-x-2 border border-gray-300 rounded-luxury">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 rounded-l-luxury"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-montserrat font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 rounded-r-luxury"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center space-x-2 bg-emerald hover:bg-emerald-light text-white px-6 py-3 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury hover:shadow-luxury-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Pincode Check */}
          <div className="bg-emerald/5 p-8 rounded-luxury border border-emerald/20">
            <h3 className="text-2xl font-playfair font-bold text-emerald mb-4">
              Check Delivery Availability
            </h3>
            <p className="text-gray-700 font-montserrat mb-4">
              Enter your pincode to check if we deliver to your area
            </p>
            <div className="flex space-x-3">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit pincode"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-luxury font-montserrat focus:outline-none focus:ring-2 focus:ring-emerald"
                maxLength={6}
              />
              <button
                onClick={handleCheckPincode}
                disabled={pincodeStatus.checking}
                className="px-6 py-3 bg-gold hover:bg-gold-light text-white rounded-luxury font-montserrat font-semibold transition-all disabled:opacity-50"
              >
                {pincodeStatus.checking ? 'Checking...' : 'Check'}
              </button>
            </div>

            {pincodeStatus.serviceable !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-luxury flex items-start space-x-3 ${
                  pincodeStatus.serviceable
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {pincodeStatus.serviceable ? (
                  <>
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-montserrat font-semibold text-green-800">
                        Great! We deliver to this area
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Expected delivery: {pincodeStatus.deliveryDays} days
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-montserrat font-semibold text-red-800">
                        Sorry, we don't deliver to this pincode yet
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Contact us for custom delivery options
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* AR Viewer */}
          <div className="bg-gold/5 p-8 rounded-luxury border border-gold/20">
            <h3 className="text-2xl font-playfair font-bold text-emerald mb-4">
              View in Your Room
            </h3>
            <p className="text-gray-700 font-montserrat mb-6">
              Use AR technology to see how this sofa looks in your space
            </p>
            <button
              onClick={() => alert('AR Viewer coming soon! This feature uses WebXR to place the sofa in your room using your phone camera.')}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-white px-6 py-4 rounded-luxury font-montserrat font-semibold shadow-luxury hover:shadow-gold-glow transition-all"
            >
              🎯 Launch AR Viewer
            </button>
            <p className="text-xs text-gray-500 font-montserrat mt-3">
              * Requires a compatible smartphone with AR capabilities
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-luxury">
            <Truck className="w-10 h-10 text-emerald flex-shrink-0" />
            <div>
              <p className="font-montserrat font-semibold text-charcoal">Free Delivery</p>
              <p className="text-sm text-gray-600">On orders above ₹50,000</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-luxury">
            <Shield className="w-10 h-10 text-emerald flex-shrink-0" />
            <div>
              <p className="font-montserrat font-semibold text-charcoal">5-Year Warranty</p>
              <p className="text-sm text-gray-600">Complete protection</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-luxury">
            <Star className="w-10 h-10 text-gold fill-gold flex-shrink-0" />
            <div>
              <p className="font-montserrat font-semibold text-charcoal">Premium Rated</p>
              <p className="text-sm text-gray-600">4.9/5 customer satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
