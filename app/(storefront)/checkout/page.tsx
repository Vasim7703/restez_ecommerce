'use client'

declare global {
  interface Window {
    Razorpay: any;
  }
}


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Home, ArrowRight,
  ShieldCheck, Truck, CheckCircle2, ChevronDown, ChevronUp, Plus
} from 'lucide-react'
import { useCartStore, useUserMetaStore, useAuthStore } from '@/lib/store'
import { formatPrice, generateOrderId } from '@/lib/utils'

type Step = 'address' | 'payment' | 'confirm'

const paymentMethods = [
  { id: 'cod',  label: 'Cash on Delivery',  icon: '💵', desc: 'Pay when your sofa arrives' },
  { id: 'upi',  label: 'UPI / QR Code',      icon: '📱', desc: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'All major cards accepted' },
  { id: 'emi',  label: 'No-Cost EMI',         icon: '🏦', desc: '0% EMI, 6–24 months' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const { addresses, addOrder, addAddress } = useUserMetaStore()
  const { user, isAuthenticated } = useAuthStore()
  
  const [step, setStep] = useState<Step>('address')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [addAssembly, setAddAssembly] = useState(false)
  const [orderError, setOrderError] = useState('')

  // Address Selection State
  const defaultAddr = addresses.find(a => a.is_default) || addresses[0]
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddr ? defaultAddr.id : null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(addresses.length === 0)

  const [address, setAddress] = useState({
    name: user?.name || '', email: user?.email || '', phone: '',
    street: '', city: '', state: '', pincode: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Update form if we have no addresses and user logs in
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
       setSelectedAddressId(addresses[0].id)
       setShowNewAddressForm(false)
    }
  }, [addresses, selectedAddressId])

  if (!mounted) return null

  const subtotal = getTotal()
  const shipping = subtotal > 50000 ? 0 : 2000
  const assemblyFee = addAssembly ? 999 : 0
  const total = subtotal + shipping + assemblyFee

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald bg-white transition-all'
  const labelCls = 'block text-xs font-montserrat font-semibold text-gray-600 mb-1.5'

  const addrValid = address.name && address.email && address.phone.length >= 10
    && address.street && address.city && address.state && address.pincode.length === 6

  const finalAddress = showNewAddressForm ? address : (addresses.find(a => a.id === selectedAddressId) || address)

    const placeOrder = async () => {
    setLoading(true)
    
    // If entered a new address, optionally save it to store
    if (showNewAddressForm && addrValid) {
       addAddress({
         ...address,
         is_default: addresses.length === 0
       })
    }
    
    const orderAddr = showNewAddressForm ? address : (addresses.find(a => a.id === selectedAddressId) || address)

    // HANDLE RAZORPAY PAYMENT (For non-COD methods)
    if (paymentMethod !== 'cod') {
      try {
        // 1. Create Razorpay Order
        const res = await fetch('/api/checkout/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total }),
        });
        
        if (!res.ok) throw new Error('Razorpay not configured');
        const rzpOrder = await res.json();
        if (!rzpOrder.id) throw new Error('Failed to create Razorpay order');

        // 2. Load Razorpay script and open checkout
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) throw new Error('Razorpay SDK failed to load');

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'RESTEZ Luxury',
          description: 'Luxury Furniture Purchase',
          order_id: rzpOrder.id,
          config: {
            display: {
              blocks: {
                banks: {
                  name: 'Pay using UPI',
                  instruments: [{ method: 'upi' }],
                },
              },
              sequence: ['block.banks'],
              preferences: {
                show_default_blocks: paymentMethod !== 'upi',
              },
            },
          },
          handler: async (response: any) => {
            // 3. Verify Payment
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              processFinalOrder(orderAddr, 'Paid via Razorpay');
            } else {
              setOrderError('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          },
          prefill: {
            name: orderAddr.name,
            email: 'email' in orderAddr ? orderAddr.email : (user?.email || ''),
            contact: orderAddr.phone,
          },
          theme: { color: '#004D40' },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        
      } catch (err) {
        console.error('Razorpay Error:', err);
        // ── Graceful fallback: proceed as COD when payment gateway is not yet configured ──
        setOrderError('Online payment is being set up. Your order has been placed as Cash on Delivery — you can pay when it arrives.');
        processFinalOrder(orderAddr, 'Cash on Delivery (Payment gateway pending setup)');
      }

      return;
    }

    // Default flow for COD
    processFinalOrder(orderAddr, 'Cash on Delivery');
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processFinalOrder = async (orderAddr: any, statusLabel: string) => {
    setLoading(true)
    try {
      // Always use the signed-in user's email for the order (must match session)
      const orderEmail = user?.email || ''

      // Map cart items → shape expected by /api/orders
      const mappedItems = items.map(item => ({
        productId:   item.product.id,
        quantity:    item.quantity,
        fabric_type: item.fabric_type || 'standard',
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name:  orderAddr.name,
          email:          orderEmail,
          phone:          orderAddr.phone,
          address: {
            street:  orderAddr.street,
            city:    orderAddr.city,
            state:   orderAddr.state,
            pincode: orderAddr.pincode,
          },
          items:          mappedItems,
          subtotal,
          discount:       0,
          total,
          payment_method: paymentMethod,
          payment_status: statusLabel,
        }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || `Server error ${response.status}`)
      }

      const responseData = await response.json()
      setOrderId(responseData.order.id)
      setOrderPlaced(true)
      clearCart()
    } catch (error: any) {
      console.error('Error placing order:', error)
      setOrderError(error.message || 'Error finalizing order. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  // Guard: redirect to cart if not logged in
  if (mounted && !isAuthenticated) {
    router.replace('/cart')
    return null
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald/5 to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </motion.div>
          <h1 className="text-4xl font-playfair font-bold text-emerald mb-3">Order Placed!</h1>
          <p className="text-gray-600 font-montserrat text-lg mb-2">Thank you for choosing RESTEZ</p>
          <p className="text-sm text-gray-500 font-montserrat mb-1">Order ID:</p>
          <p className="text-gold font-montserrat font-bold text-xl mb-6">{orderId}</p>
          <div className="bg-emerald/5 border border-emerald/20 rounded-luxury p-4 mb-8 text-left space-y-2">
            <div className="flex items-center space-x-2 text-sm font-montserrat text-gray-700">
              <Truck className="w-4 h-4 text-emerald" />
              <span>Expected delivery in <strong>7–14 business days</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-sm font-montserrat text-gray-700">
              <Mail className="w-4 h-4 text-emerald" />
              <span>Confirmation sent to <strong>{showNewAddressForm ? address.email : (user?.email || 'your email')}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-sm font-montserrat text-gray-700">
              <Phone className="w-4 h-4 text-emerald" />
              <span>Our team will call you within <strong>24 hours</strong></span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="px-6 py-3 bg-emerald hover:bg-emerald-light text-white rounded-luxury font-montserrat font-semibold transition-all"
            >
              View Orders
            </button>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 border-2 border-emerald text-emerald hover:bg-emerald/5 rounded-luxury font-montserrat font-semibold transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-emerald">Checkout</h1>
          <p className="text-gray-500 font-montserrat text-sm mt-1">Secure checkout powered by RESTEZ</p>
        </div>

        {/* Steps */}
        <div className="flex items-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
          {(['address', 'payment', 'confirm'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => step !== 'address' && s !== 'confirm' ? setStep(s) : undefined}
                className={`flex items-center space-x-1.5 px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-montserrat font-semibold transition-all ${
                  step === s
                    ? 'bg-emerald text-white shadow-luxury'
                    : ['address', 'payment'].indexOf(s) < ['address', 'payment', 'confirm'].indexOf(step)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-400 border border-gray-200'
                }`}
              >
                <span>{i + 1}</span>
                <span className="hidden xs:inline sm:inline capitalize">{s === 'address' ? 'Delivery' : s === 'payment' ? 'Payment' : 'Confirm'}</span>
              </button>
              {i < 2 && <div className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 ${['address', 'payment'].indexOf(s) < ['address', 'payment', 'confirm'].indexOf(step) ? 'bg-green-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* STEP 1: Address */}
            {step === 'address' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-luxury p-6 space-y-5"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-playfair font-bold text-charcoal flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gold" />
                    <span>Delivery Address</span>
                  </h2>
                  {addresses.length > 0 && showNewAddressForm && (
                     <button onClick={() => setShowNewAddressForm(false)} className="text-sm font-semibold text-emerald hover:underline">
                        Use Saved Address
                     </button>
                  )}
                </div>

                {addresses.length > 0 && !showNewAddressForm ? (
                   <div className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {addresses.map(addr => (
                         <div 
                           key={addr.id}
                           onClick={() => setSelectedAddressId(addr.id)}
                           className={`cursor-pointer border-2 p-4 rounded-luxury transition-all relative ${selectedAddressId === addr.id ? 'border-emerald bg-emerald/5' : 'border-gray-200 hover:border-emerald/50'}`}
                         >
                           {selectedAddressId === addr.id && (
                             <div className="absolute top-4 right-4 text-emerald">
                               <CheckCircle2 className="w-5 h-5" />
                             </div>
                           )}
                           <h4 className="font-montserrat font-bold text-charcoal">{addr.name}</h4>
                           <p className="text-sm font-montserrat text-gray-500 mt-1">{addr.phone}</p>
                           <p className="text-sm font-montserrat text-gray-500 mt-2 line-clamp-2">{addr.street}</p>
                           <p className="text-sm font-montserrat text-gray-500">{addr.city}, {addr.state} {addr.pincode}</p>
                         </div>
                       ))}
                     </div>
                     <button 
                       onClick={() => setShowNewAddressForm(true)} 
                       className="text-sm font-montserrat font-semibold text-emerald flex items-center space-x-1 hover:text-emerald-light transition-colors py-2"
                     >
                       <Plus className="w-4 h-4" /> <span>Add a new address</span>
                     </button>
                     
                     <button
                       onClick={() => setStep('payment')}
                       disabled={!selectedAddressId}
                       className="w-full flex items-center justify-center space-x-2 bg-emerald hover:bg-emerald-light disabled:opacity-50 text-white py-4 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury mt-4"
                     >
                       <span>Continue to Payment</span>
                       <ArrowRight className="w-5 h-5" />
                     </button>
                   </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} placeholder="Your full name" className={`${inputCls} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="email" value={address.email} onChange={e => setAddress({...address, email: e.target.value})} placeholder="you@example.com" className={`${inputCls} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value.replace(/\D/g,'').slice(0,10)})} placeholder="10-digit mobile" className={`${inputCls} pl-10`} />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Street Address *</label>
                        <div className="relative">
                          <Home className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                          <textarea value={address.street} onChange={e => setAddress({...address, street: e.target.value})} placeholder="House no., Street, Area, Landmark" rows={2} className={`${inputCls} pl-10 resize-none`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>City *</label>
                        <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="Mumbai" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>State *</label>
                        <select value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className={inputCls}>
                          <option value="">Select State</option>
                          {['Maharashtra','Gujarat','Rajasthan','Delhi','Karnataka','Tamil Nadu','Uttar Pradesh','West Bengal','Telangana','Madhya Pradesh','Punjab','Haryana'].map(s => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Pincode *</label>
                        <input value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value.replace(/\D/,'').slice(0,6)})} placeholder="6-digit pincode" className={inputCls} maxLength={6} />
                      </div>
                    </div>

                    <button
                      onClick={() => setStep('payment')}
                      disabled={!addrValid}
                      className="w-full flex items-center justify-center space-x-2 bg-emerald hover:bg-emerald-light disabled:opacity-50 text-white py-4 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury mt-2"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 2: Payment */}
            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-luxury p-6 space-y-5"
              >
                <h2 className="text-xl font-playfair font-bold text-charcoal">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`w-full flex items-center space-x-4 p-4 rounded-luxury border-2 transition-all text-left ${
                        paymentMethod === m.id
                          ? 'border-emerald bg-emerald/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className="font-montserrat font-semibold text-charcoal text-sm">{m.label}</p>
                        <p className="text-xs text-gray-500 font-montserrat">{m.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? 'border-emerald' : 'border-gray-300'}`}>
                        {paymentMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald" />}
                      </div>
                    </button>
                  ))}
                </div>


                <div className="flex space-x-3">
                  <button onClick={() => setStep('address')} className="flex-1 py-3 border-2 border-gray-200 rounded-luxury font-montserrat font-semibold text-gray-600 hover:bg-gray-50 transition-all">Back</button>
                  <button onClick={() => setStep('confirm')} className="flex-1 flex items-center justify-center space-x-2 bg-emerald hover:bg-emerald-light text-white py-4 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury">
                    <span>Review Order</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Confirm */}
            {step === 'confirm' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Address summary */}
                <div className="bg-white rounded-2xl shadow-luxury p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-playfair font-bold text-charcoal">Delivery To</h3>
                    <button onClick={() => setStep('address')} className="text-xs text-gold font-montserrat font-semibold">Change</button>
                  </div>
                  <p className="font-montserrat font-semibold text-gray-800">{finalAddress?.name}</p>
                  <p className="text-sm text-gray-600 font-montserrat">{finalAddress?.street}, {finalAddress?.city}, {finalAddress?.state} — {finalAddress?.pincode}</p>
                  <p className="text-sm text-gray-500 font-montserrat">{finalAddress?.phone} {showNewAddressForm && 'email' in (finalAddress || {}) ? `· ${(finalAddress as any).email}` : ''}</p>
                </div>

                {/* Payment summary */}
                <div className="bg-white rounded-2xl shadow-luxury p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-playfair font-bold text-charcoal">Payment</h3>
                    <button onClick={() => setStep('payment')} className="text-xs text-gold font-montserrat font-semibold">Change</button>
                  </div>
                  <p className="font-montserrat text-sm text-gray-700">
                    {paymentMethods.find(m => m.id === paymentMethod)?.icon}{' '}
                    {paymentMethods.find(m => m.id === paymentMethod)?.label}
                  </p>
                </div>

                {/* Place Order */}
                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-white py-5 rounded-luxury font-montserrat font-bold text-lg transition-all shadow-luxury hover:shadow-gold-glow"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-6 h-6" />
                      <span>Place Order · {formatPrice(total)}</span>
                    </>
                  )}
                </button>
                {orderError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-luxury"
                  >
                    <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm text-red-700 font-montserrat">{orderError}</p>
                      <button onClick={() => setOrderError('')} className="text-xs text-red-500 underline mt-1 font-montserrat">Dismiss</button>
                    </div>
                  </motion.div>
                )}
                <p className="text-center text-xs text-gray-400 font-montserrat">
                  🔒 Secured & encrypted. By placing your order you agree to our Terms.
                </p>
              </motion.div>
            )}

          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-luxury sticky top-28 overflow-hidden">
              <button
                onClick={() => setSummaryOpen(!summaryOpen)}
                className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100"
              >
                <h2 className="font-playfair font-bold text-charcoal">Order Summary ({items.length})</h2>
                {summaryOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              <AnimatePresence>
                {summaryOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 space-y-4 max-h-64 overflow-y-auto">
                      {items.map(item => (
                        <div key={`${item.product.id}-${item.selected_fabric}`} className="flex space-x-3">
                          <div
                            className="w-14 h-14 rounded-lg bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url(${item.product.images.main})` }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-montserrat font-semibold text-charcoal truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-500 font-montserrat">{item.selected_fabric} · Qty {item.quantity}</p>
                            <p className="text-sm font-montserrat font-bold text-emerald">{formatPrice(item.total_price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Assembly Service Upsell */}
              <div className="px-6 py-4 border-t border-gray-100 bg-emerald/5">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      checked={addAssembly} 
                      onChange={() => setAddAssembly(!addAssembly)} 
                      className="w-4 h-4 accent-emerald cursor-pointer rounded" 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-montserrat font-bold text-charcoal group-hover:text-emerald transition-colors">Add Artech Professional Assembly</p>
                    <p className="text-xs text-gray-600 font-montserrat mt-1">Our experts will unpack, assemble, and place the furniture in your room (+₹999)</p>
                  </div>
                </label>
              </div>

              {/* Price breakdown */}
              <div className="px-6 py-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm font-montserrat text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-montserrat text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-charcoal'}`}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {subtotal < 50000 && (
                  <p className="text-xs text-gold font-montserrat">Add {formatPrice(50000 - subtotal)} more for free shipping</p>
                )}
                {addAssembly && (
                  <div className="flex justify-between text-sm font-montserrat text-gray-600">
                    <span>Assembly Service</span>
                    <span className="font-semibold text-charcoal">{formatPrice(999)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100 flex justify-between font-playfair text-lg font-bold">
                  <span>Total</span>
                  <span className="text-emerald">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="px-6 pb-5 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-gray-500 font-montserrat">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Secure 256-bit SSL encrypted payment</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 font-montserrat">
                  <Truck className="w-4 h-4 text-emerald" />
                  <span>7–14 day delivery · Professional installation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
