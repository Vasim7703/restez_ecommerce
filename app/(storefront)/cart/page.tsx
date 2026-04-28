'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Lock } from 'lucide-react'
import { useCartStore, useAuthStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/Toast'
import AuthModal from '@/components/AuthModal'

export default function CartPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const { showToast } = useToast()

  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const subtotal = getTotal()
  const shipping = subtotal > 50000 ? 0 : 2000
  const total = subtotal + shipping - discount

  const applyCoupon = () => {
    if (couponCode === 'FESTIVE20') {
      setDiscount(subtotal * 0.2)
      showToast('Coupon applied! 20% discount added 🎉', 'success')
    } else if (couponCode === 'WELCOME10') {
      setDiscount(subtotal * 0.1)
      showToast('Coupon applied! 10% discount added ✨', 'success')
    } else {
      showToast('Invalid coupon code. Please check and try again.', 'error')
    }
  }

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      router.push('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-playfair font-bold text-charcoal mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-600 font-montserrat mb-8">
            Start shopping and add items to your cart
          </p>
          <button
            onClick={() => router.push('/products')}
            className="inline-flex items-center space-x-2 bg-emerald hover:bg-emerald-light text-white px-8 py-4 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury"
          >
            <span>Browse Collections</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 pb-28 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-emerald mb-6 sm:mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Order Summary — first on mobile (order-first), last column on desktop */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-white p-5 sm:p-6 rounded-luxury shadow-luxury lg:sticky lg:top-24">
              <h2 className="text-2xl font-playfair font-bold text-emerald mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between font-montserrat">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between font-montserrat text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-montserrat">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                {subtotal < 50000 && (
                  <p className="text-xs text-gold font-montserrat">
                    Add {formatPrice(50000 - subtotal)} more for free shipping
                  </p>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between font-playfair text-xl font-bold">
                    <span className="text-charcoal">Total</span>
                    <span className="text-emerald">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                  Have a coupon?
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-gold hover:bg-gold-light text-white rounded-luxury font-montserrat font-semibold text-sm transition-colors"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-xs text-gray-400 font-montserrat mt-1">Try: FESTIVE20 or WELCOME10</p>
              </div>

              {/* Desktop Checkout CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="hidden lg:flex w-full bg-emerald hover:bg-emerald-light text-white px-6 py-4 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury hover:shadow-luxury-lg items-center justify-center space-x-2 group"
              >
                {!isAuthenticated && <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {!isAuthenticated && (
                <p className="hidden lg:block text-center text-xs text-gray-400 font-montserrat mt-2">
                  You&apos;ll need to sign in to complete your order
                </p>
              )}

              <button
                onClick={() => router.push('/products')}
                className="w-full mt-3 bg-white hover:bg-gray-50 text-emerald border-2 border-emerald px-6 py-3 rounded-luxury font-montserrat font-semibold transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="lg:col-span-2 order-last lg:order-first space-y-4">

            {items.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.selected_fabric}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white p-4 sm:p-6 rounded-luxury shadow-md"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Product Image */}
                  <div
                    className="w-20 h-20 sm:w-32 sm:h-32 bg-cover bg-center rounded-luxury flex-shrink-0"
                    style={{ backgroundImage: `url(${item.product.images.main})` }}
                  />

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-base sm:text-xl font-playfair font-bold text-charcoal mb-1 sm:mb-2 leading-snug">
                          {item.product.name}
                        </h3>
                        <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm font-montserrat text-gray-600">
                          <p>Fabric: <span className="text-emerald font-semibold">{item.selected_fabric}</span></p>
                          <p className="hidden sm:block">Type: <span className="text-emerald font-semibold capitalize">{item.fabric_type}</span></p>
                          <p className="hidden sm:block">Material: {item.product.material}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          removeFromCart(item.product.id)
                          showToast('Item removed from cart.', 'info')
                        }}
                        className="p-1.5 sm:p-2 hover:bg-red-50 rounded-full transition-colors group flex-shrink-0 h-auto min-h-0"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-red-500" />
                      </button>
                    </div>

                    {/* Quantity & Price */}
                    <div className="mt-3 sm:mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-1 sm:space-x-2 border border-gray-300 rounded-luxury">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-l-luxury min-h-0"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="px-2 sm:px-4 font-montserrat font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-r-luxury min-h-0"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg sm:text-2xl font-playfair font-bold text-emerald">
                          {formatPrice(item.total_price * item.quantity)}
                        </p>
                        <p className="text-xs text-gray-500 font-montserrat hidden sm:block">
                          {formatPrice(item.total_price)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      {/* Sticky Mobile Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 pb-safe z-40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-montserrat text-gray-500">Total</span>
          <span className="text-xl font-playfair font-bold text-emerald">{formatPrice(total)}</span>
        </div>
        <button
          onClick={handleProceedToCheckout}
          className="w-full bg-emerald hover:bg-emerald-light text-white px-6 py-3.5 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury flex items-center justify-center space-x-2"
        >
          {!isAuthenticated && <Lock className="w-4 h-4" />}
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Auth Modal — shown when guest tries to checkout */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => router.push('/checkout')}
        message="Sign in or create an account to complete your purchase"
      />
    </div>
  )
}
