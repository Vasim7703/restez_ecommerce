'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Share2, Truck, Shield, Star, Minus, Plus, Check, X } from 'lucide-react'
import ScrollytellingViewer from '@/components/ScrollytellingViewer'
import ProductReviews from '@/components/ProductReviews'
import WillItFitModal from '@/components/WillItFitModal'
import SwatchRequestModal from '@/components/SwatchRequestModal'
import EmiModal from '@/components/EmiModal'
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store'
import { formatPrice, validatePincode, checkPincodeServiceability } from '@/lib/utils'
import { Product, CartItem } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import AuthModal from '@/components/AuthModal'


/** If admin uploaded a photo for this fabric, use it. Otherwise returns null — show base image unchanged. */
const getFabricImage = (product: { fabric_images: Record<string, string>; images: { main: string } }, fabricName: string): string | null => {
  return product.fabric_images?.[fabricName] || null
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedFabricType, setSelectedFabricType] = useState<'standard' | 'premium'>('standard')
  const [selectedFabric, setSelectedFabric] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('')
  const [pincodeStatus, setPincodeStatus] = useState<{
    checking: boolean
    serviceable?: boolean
    deliveryDays?: number
  }>({ checking: false })
  const [showARViewer, setShowARViewer] = useState(false)
  const [showFitGuide, setShowFitGuide] = useState(false)
  const [showSwatchModal, setShowSwatchModal] = useState(false)
  const [showEmiModal, setShowEmiModal] = useState(false)

  const addToCart = useCartStore((state) => state.addToCart)
  const { toggleWishlist, isInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const { showToast } = useToast()
  const [inWishlist, setInWishlist] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingAddToCart, setPendingAddToCart] = useState(false)

  // Hydration fix for wishlist
  useState(() => {
    if (product) {
      setInWishlist(isInWishlist(product.id))
    }
  })

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const found = data.find(p => p.slug === params.slug)
        if (found) {
          setProduct(found)
          setSelectedFabric(found.fabric_options.standard[0])
          setRelatedProducts(data.filter(p => p.id !== found.id).slice(0, 3))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to load product", err)
        setLoading(false)
      })
  }, [params.slug])

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-32 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
        <p className="text-xl font-playfair text-charcoal">Loading Product Details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-white min-h-screen py-32 text-center">
        <h1 className="text-3xl font-playfair mb-4">Product Not Found</h1>
        <button onClick={() => router.push('/products')} className="text-emerald hover:underline">Return to Products</button>
      </div>
    )
  }

  const currentPrice = selectedFabricType === 'premium' 
    ? product.base_price + product.premium_upcharge 
    : product.base_price

  const avgRating = product.reviews && product.reviews.length > 0 
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0

  // If admin uploaded a photo for the selected fabric, use it for the fabric section and main view
  const fabricSpecificImage = getFabricImage(product, selectedFabric)

  const scrollytellingSections = [
    {
      id: 'front',
      title: 'Front View',
      content: 'Experience the grand frontal presence of our masterpiece. Notice the intricate carved details that showcase the artisan\'s dedication to traditional craftsmanship.',
      image: fabricSpecificImage || product.images.front,
    },
    {
      id: 'frame',
      title: 'Frame & Material',
      content: `Constructed from premium ${product.material}, sourced from sustainable forests. Each piece of wood is carefully selected for its strength, grain pattern, and durability. Our artisans at Artech Furniture have over 20 years of woodworking expertise.`,
      image: product.images.angle_45,
    },
    {
      id: 'fabric',
      title: `Fabric & Upholstery — ${selectedFabric}`,
      content: 'Choose from our curated selection of fabrics. Standard options feature durable, stain-resistant materials perfect for daily use. Premium fabrics include silk blends, Italian leather, and hand-woven brocades that add unparalleled luxury.',
      // Use fabric-specific image here — this is the colour preview section
      image: fabricSpecificImage || product.images.side,
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
    if (!isAuthenticated) {
      setPendingAddToCart(true)
      setShowAuthModal(true)
      return
    }
    doAddToCart()
  }

  const doAddToCart = () => {
    if (!product) return
    const cartItem: CartItem = {
      product,
      quantity,
      selected_fabric: selectedFabric,
      fabric_type: selectedFabricType,
      total_price: currentPrice,
    }
    addToCart(cartItem)
    showToast(`${product.name} added to cart! 🛒`, 'success')
  }

  const handleAuthSuccess = () => {
    if (pendingAddToCart) {
      doAddToCart()
      setPendingAddToCart(false)
    }
  }

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-montserrat text-gray-500 overflow-hidden">
          <button onClick={() => router.push('/')} className="hover:text-emerald flex-shrink-0">Home</button>
          <span>/</span>
          <button onClick={() => router.push('/products')} className="hover:text-emerald flex-shrink-0">Products</button>
          <span>/</span>
          <span className="text-emerald truncate">{product.name}</span>
        </nav>
      </div>

      {/* ── MOBILE IMAGE GALLERY (hidden on desktop) ── */}
      <div className="md:hidden">
        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
          {/* Show fabric-specific photo if admin uploaded one, otherwise show base image */}
          <img
            src={getFabricImage(product, selectedFabric) || product.images.main}
            alt={`${product.name} — ${selectedFabric}`}
            className="w-full h-full object-cover transition-all duration-500"
          />
          {!product.in_stock && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-montserrat font-bold px-3 py-1 rounded-full">Out of Stock</div>
          )}

          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            <button onClick={() => { toggleWishlist(product); setInWishlist(!inWishlist) }}
              className={`p-2.5 rounded-full shadow-md ${ inWishlist ? 'bg-red-50 text-red-500' : 'bg-white text-gray-500'}`}>
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
            </button>
            <button className="p-2.5 bg-white rounded-full shadow-md text-gray-500">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Thumbnail Strip */}
        <div className="flex space-x-2 px-3 py-2 overflow-x-auto scrollbar-hide">
          {[product.images.main, product.images.front, product.images.angle_45, product.images.side, product.images.back, product.images.closeup].filter(Boolean).map((img, i) => (
            <div key={i} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200">
              <img src={img} alt={`view ${i+1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Mobile Product Info */}
        <div className="px-3 pt-2 pb-4 border-b border-gray-100">
          <h1 className="text-xl font-playfair font-bold text-charcoal leading-snug">{product.name}</h1>
          <div className="flex items-center space-x-2 mt-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'}`} />
              ))}
            </div>
            <a href="#reviews" className="text-xs text-blue-600 font-montserrat">{product.reviews?.length ?? 0} ratings</a>
          </div>
          <div className="mt-3 pb-3 border-b border-dashed border-gray-200">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-charcoal font-montserrat">{formatPrice(currentPrice)}</span>
              {selectedFabricType === 'premium' && (
                <span className="text-xs text-gold font-montserrat">Premium fabric included</span>
              )}
            </div>
            <button onClick={() => setShowEmiModal(true)} className="text-xs text-emerald font-montserrat mt-1 hover:underline">
              No Cost EMI from {formatPrice(Math.round(currentPrice / 6))}/mo
            </button>
          </div>
          {/* Delivery row */}
          <div className="mt-3 flex items-start space-x-2">
            <Truck className="w-4 h-4 text-emerald mt-0.5 flex-shrink-0" />
            <div className="text-sm font-montserrat">
              <span className="font-semibold text-emerald">Free delivery</span>
              <span className="text-gray-500"> on orders above ₹50,000 · 7–14 days</span>
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald flex-shrink-0" />
            <span className="text-sm font-montserrat text-gray-600">5-Year warranty · <span className="text-emerald font-semibold">{product.material}</span></span>
          </div>
        </div>

        {/* Mobile Fabric Selector */}
        <div className="px-3 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-montserrat font-semibold text-charcoal">Fabric Type</p>
            <button onClick={() => setShowSwatchModal(true)} className="text-xs text-gold font-montserrat">Request Swatches →</button>
          </div>
          <div className="flex space-x-2 mb-3">
            <button onClick={() => { setSelectedFabricType('standard'); setSelectedFabric(product.fabric_options.standard[0]) }}
              className={`flex-1 py-2 rounded-xl text-sm font-montserrat font-semibold border-2 transition-all ${ selectedFabricType === 'standard' ? 'border-emerald bg-emerald text-white' : 'border-gray-200 text-gray-600'}`}>
              Standard
            </button>
            <button onClick={() => { setSelectedFabricType('premium'); setSelectedFabric(product.fabric_options.premium[0]) }}
              className={`flex-1 py-2 rounded-xl text-sm font-montserrat font-semibold border-2 transition-all ${ selectedFabricType === 'premium' ? 'border-gold bg-gold text-white' : 'border-gray-200 text-gray-600'}`}>
              Premium +{formatPrice(product.premium_upcharge)}
            </button>
          </div>
          <select value={selectedFabric} onChange={e => setSelectedFabric(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald bg-white">
            {(selectedFabricType === 'standard' ? product.fabric_options.standard : product.fabric_options.premium).map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Mobile Delivery Check */}
        <div className="px-3 py-4 border-b border-gray-100">
          <p className="text-sm font-montserrat font-semibold text-charcoal mb-2">Check Delivery</p>
          <div className="flex space-x-2">
            <input type="text" value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="Enter pincode" maxLength={6}
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald" />
            <button onClick={handleCheckPincode} disabled={pincodeStatus.checking}
              className="px-4 py-2.5 bg-emerald text-white rounded-xl font-montserrat text-sm font-semibold disabled:opacity-50">Check</button>
          </div>
          {pincodeStatus.serviceable !== undefined && (
            <p className={`mt-2 text-sm font-montserrat ${pincodeStatus.serviceable ? 'text-green-600' : 'text-red-500'}`}>
              {pincodeStatus.serviceable ? `✓ Delivery in ${pincodeStatus.deliveryDays} days` : '✗ Not serviceable'}
            </p>
          )}
        </div>

        {/* Mobile Description */}
        <div className="px-3 py-4 border-b border-gray-100">
          <p className="text-sm font-montserrat font-semibold text-charcoal mb-1">About this item</p>
          <p className="text-sm font-montserrat text-gray-600 leading-relaxed">{product.description}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-montserrat">
            <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-500">Seating</span><br/><span className="font-semibold">{product.seating_capacity} Seater</span></div>
            <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-500">Size (L×W×H)</span><br/><span className="font-semibold">{product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height} cm</span></div>
            <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-500">Style</span><br/><span className="font-semibold">{product.style}</span></div>
            <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-500">Collection</span><br/><span className="font-semibold">{product.collection}</span></div>
          </div>
        </div>
      </div>

      {/* Product Header — desktop only */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200">
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
              <a href="#reviews" className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'}`} 
                  />
                ))}
              </a>
              <a href="#reviews" className="text-sm text-gray-600 font-montserrat hover:text-emerald hover:underline transition-colors">
                ({product.reviews ? product.reviews.length : 0} reviews)
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                toggleWishlist(product)
                setInWishlist(!inWishlist)
              }}
              className={`p-3 border rounded-full transition-colors ${
                inWishlist 
                  ? 'border-red-200 bg-red-50 text-red-500' 
                  : 'border-gray-300 hover:bg-emerald/5 hover:border-emerald text-gray-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
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

      {/* Main Content: 360° Scrollytelling — desktop only */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollytellingViewer
          sections={scrollytellingSections}
        />
      </div>

      {/* Product Configuration Panel — desktop only */}
      <div className="hidden md:block sticky bottom-0 bg-white border-t-2 border-gold/30 shadow-luxury-lg z-40">
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
              <button 
                onClick={() => setShowEmiModal(true)}
                className="text-xs text-emerald mt-2 font-montserrat font-semibold hover:underline"
              >
                No Cost EMI from {formatPrice(Math.round(currentPrice / 6))}/mo. View Plans
              </button>
            </div>

            {/* Fabric Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-montserrat font-semibold text-gray-700">
                  Select Fabric Type
                </p>
                <button 
                  onClick={() => setShowSwatchModal(true)}
                  className="text-xs text-gold hover:text-gold-dark font-montserrat font-medium"
                >
                  Request Swatches
                </button>
              </div>
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
            <p className="text-xs text-gray-500 font-montserrat mt-3 mb-6">
              * Requires a compatible smartphone with AR capabilities
            </p>

            <div className="pt-6 border-t border-gold/20">
              <h3 className="text-xl font-playfair font-bold text-emerald mb-3">
                Will it Fit? 
              </h3>
              <p className="text-gray-700 font-montserrat text-sm mb-4">
                Not sure if {product.name} will fit through your doors or elevator? Use our dimensional guide to check.
              </p>
              <button
                onClick={() => setShowFitGuide(true)}
                className="w-full bg-white border border-emerald text-emerald hover:bg-emerald hover:text-white px-6 py-3 rounded-luxury font-montserrat font-semibold transition-colors"
              >
                Check Dimensions Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviews product={product} />

      {/* Related Products */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
          <h2 className="text-xl sm:text-3xl font-playfair font-bold text-charcoal mb-5 sm:mb-8 sm:text-center">Bought Together</h2>
          {/* Mobile: horizontal scroll */}
          <div className="flex space-x-3 overflow-x-auto pb-2 md:hidden scrollbar-hide">
            {relatedProducts.map((related) => {
              const relAvg = related.reviews?.length ? related.reviews.reduce((a,r)=>a+r.rating,0)/related.reviews.length : 0
              return (
                <Link key={related.id} href={`/products/${related.slug}`} className="flex-shrink-0 w-40 block">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                    <img src={related.images.main} alt={related.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-montserrat font-semibold text-charcoal line-clamp-2 leading-tight">{related.name}</p>
                  <div className="flex items-center space-x-1 my-0.5">
                    {[...Array(5)].map((_,i)=>(<Star key={i} className={`w-2.5 h-2.5 ${i<Math.round(relAvg)?'fill-gold text-gold':'fill-gray-200 text-gray-200'}`}/>))}
                  </div>
                  <p className="text-sm font-montserrat font-bold text-charcoal">{formatPrice(related.base_price)}</p>
                </Link>
              )
            })}
          </div>
          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-3 gap-8">
            {relatedProducts.map((related, idx) => {
              const relAvgRating = related.reviews?.length ? related.reviews.reduce((acc,r)=>acc+r.rating,0)/related.reviews.length : 0
              return (
                <div key={related.id} className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-luxury bg-gray-100 mb-4">
                    <img src={related.images.main} alt={related.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <Link href={`/products/${related.slug}`} className="block">
                    <h3 className="font-playfair font-bold text-lg text-charcoal group-hover:text-emerald transition-colors line-clamp-1">{related.name}</h3>
                    <div className="flex items-center space-x-1 my-1">
                      {[...Array(5)].map((_,i)=>(<Star key={i} className={`w-3.5 h-3.5 ${i<Math.round(relAvgRating)?'fill-gold text-gold':'fill-gray-200 text-gray-200'}`}/>))}
                      <span className="text-xs text-gray-400 font-montserrat ml-1">({related.reviews?.length ?? 0})</span>
                    </div>
                    <p className="text-xl font-montserrat font-bold text-charcoal">{formatPrice(related.base_price)}</p>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM BAR ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 px-3 py-3 pb-safe">
        <div className="flex space-x-3">
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className="flex-1 flex items-center justify-center space-x-2 bg-gold hover:bg-gold-light disabled:opacity-50 text-white py-3.5 rounded-xl font-montserrat font-bold text-sm transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
          <button
            onClick={() => { handleAddToCart(); router.push('/cart') }}
            disabled={!product.in_stock}
            className="flex-1 flex items-center justify-center bg-emerald hover:bg-emerald-light disabled:opacity-50 text-white py-3.5 rounded-xl font-montserrat font-bold text-sm transition-all"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="md:hidden h-20" />

      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mt-6 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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


      {/* Modals */}
      <EmiModal 
        isOpen={showEmiModal} 
        onClose={() => setShowEmiModal(false)} 
        price={currentPrice} 
      />
      
      <SwatchRequestModal 
        isOpen={showSwatchModal} 
        onClose={() => setShowSwatchModal(false)} 
        availableFabrics={[...product.fabric_options.standard, ...product.fabric_options.premium]} 
      />
      
      <WillItFitModal 
        isOpen={showFitGuide} 
        onClose={() => setShowFitGuide(false)} 
        productDimensions={product.dimensions} 
        productName={product.name} 
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingAddToCart(false) }}
        onSuccess={handleAuthSuccess}
        message="Sign in to add items to your cart and track your orders"
      />
    </div>
  )
}
