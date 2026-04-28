'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle2, Factory, ExternalLink } from 'lucide-react'
import { useUserMetaStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to load orders", err)
        setLoading(false)
      })
  }, [])

  if (!mounted) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package className="w-5 h-5 text-yellow-500" />
      case 'manufacturing': return <Factory className="w-5 h-5 text-blue-500" />
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      default: return <Package className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed'
      case 'manufacturing': return 'In Production'
      case 'shipped': return 'Shipped'
      case 'delivered': return 'Delivered'
      default: return status
    }
  }

  return (
    <div>
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-2xl font-playfair font-bold text-charcoal">Order History</h2>
        <p className="text-sm font-montserrat text-gray-500 mt-1">Track and manage your recent luxury purchases.</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
            <p className="text-xl font-playfair text-charcoal">Loading your luxury orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-emerald" />
            </div>
            <h3 className="text-xl font-playfair font-bold text-charcoal mb-2">No orders yet</h3>
            <p className="text-gray-500 font-montserrat mb-6">Looks like you haven't made your first purchase yet.</p>
            <Link 
              href="/products"
              className="inline-block px-6 py-3 bg-emerald hover:bg-emerald-light text-white font-montserrat font-semibold rounded-luxury transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border border-gray-200 rounded-luxury overflow-hidden bg-white"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center border-b border-gray-200">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs uppercase font-montserrat font-bold text-gray-500 tracking-wider">Order Placed</p>
                      <p className="text-sm font-montserrat text-charcoal">{new Date(order.createdAt || order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase font-montserrat font-bold text-gray-500 tracking-wider">Total</p>
                      <p className="text-sm font-montserrat text-charcoal">{formatPrice(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase font-montserrat font-bold text-gray-500 tracking-wider">Ship To</p>
                      <span className="text-sm font-montserrat text-emerald hover:underline cursor-pointer">
                        {order.customer_name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-1 sm:flex-none">
                    <p className="text-xs uppercase font-montserrat font-bold text-gray-500 tracking-wider">Order #</p>
                    <p className="text-sm font-montserrat text-charcoal">ORD-{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Order Status & Items */}
                <div className="p-6">
                  <div className="mb-6 flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <h3 className="text-lg font-montserrat font-bold text-charcoal">
                      {getStatusText(order.status)}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-32 aspect-square bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.product.images.main} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <Link href={`/products/${item.product.slug}`}>
                            <h4 className="font-playfair font-bold text-xl text-charcoal hover:text-emerald transition-colors">
                              {item.product.name}
                            </h4>
                          </Link>
                          <p className="text-sm font-montserrat text-gray-500 mt-1">
                            {item.product.material} • {item.fabric_type} Fabric ({item.selected_fabric})
                          </p>
                          <p className="text-sm font-montserrat text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          <div className="mt-4 flex gap-3">
                            <Link 
                              href={`/products/${item.product.slug}`}
                              className="px-4 py-2 border-2 border-emerald text-emerald hover:bg-emerald hover:text-white rounded-luxury font-montserrat font-semibold text-sm transition-colors"
                            >
                              Buy it again
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
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
