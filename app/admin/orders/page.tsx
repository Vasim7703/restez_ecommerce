'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye, X, MapPin, CreditCard, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    { value: 'carcass_manufacturing', label: 'Carcass Mfg', color: 'bg-blue-100 text-blue-800' },
    { value: 'carcass_done', label: 'Carcass Done', color: 'bg-blue-200 text-blue-900' },
    { value: 'polish', label: 'Polish', color: 'bg-amber-100 text-amber-800' },
    { value: 'polish_done', label: 'Polish Done', color: 'bg-amber-200 text-amber-900' },
    { value: 'foaming', label: 'Foaming', color: 'bg-pink-100 text-pink-800' },
    { value: 'foaming_done', label: 'Foaming Done', color: 'bg-pink-200 text-pink-900' },
    { value: 'upholstry', label: 'Upholstry', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'upholstry_done', label: 'Upholstry Done', color: 'bg-indigo-200 text-indigo-900' },
    { value: 'ready_for_qc', label: 'QC Started', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'qc_done', label: 'QC Passed', color: 'bg-yellow-200 text-yellow-900' },
    { value: 'packing', label: 'Packing', color: 'bg-orange-100 text-orange-800' },
    { value: 'packing_done', label: 'Packed', color: 'bg-orange-200 text-orange-900' },
    { value: 'ready_for_dispatch', label: 'Ready for Dispatch', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'dispatch', label: 'Dispatched', color: 'bg-green-100 text-green-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-teal-100 text-teal-800' },
  ]

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()
        setOrders(data)
      } catch (err) {
        console.error('Failed to load orders', err)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchOrders()

    // Live polling: automatically fetch new updates every 5 seconds
    const intervalId = setInterval(fetchOrders, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Optimistic UI update
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ))

    // Optional: Call an API endpoint here to actually save the status to the DB
    // await fetch(`/api/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) })
  }

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6 space-y-6 relative">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-playfair font-bold text-emerald mb-2">
          Order Management
        </h1>
        <p className="text-gray-600 font-montserrat">
          Track and manage all live customer orders
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-luxury shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID or customer name..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-luxury font-montserrat focus:outline-none focus:ring-2 focus:ring-emerald"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-luxury shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Order Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading live orders...
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-montserrat font-semibold text-emerald text-sm">
                        ORD-{order.id.slice(0,8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 font-montserrat mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-montserrat font-semibold text-gray-900 text-sm">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-gray-500 font-montserrat mt-1">
                        {order.phone}
                      </p>
                      <p className="text-xs text-gray-500 font-montserrat truncate max-w-[150px]">
                        {order.address?.city}, {order.address?.state}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-montserrat text-gray-900 text-sm">
                      {order.items?.length} Item(s)
                    </p>
                    <p className="text-xs text-gray-500 font-montserrat mt-1 truncate max-w-[150px]">
                      {order.items?.[0]?.product?.name} {order.items?.length > 1 ? '...' : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-montserrat font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-[10px] uppercase text-gray-400 font-bold mt-1">
                      {order.payment_method}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-2 text-xs font-montserrat font-semibold rounded-lg border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald ${getStatusColor(order.status)}`}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-emerald/10 rounded-lg transition-colors group"
                      >
                        <Eye className="w-4 h-4 text-gray-600 group-hover:text-emerald" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-montserrat">
              No orders found matching your search
            </p>
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusOptions.map((status) => {
          const count = orders.filter(o => o.status === status.value).length
          return (
            <div key={status.value} className="bg-white p-4 rounded-luxury shadow-md">
              <p className="text-xs text-gray-600 font-montserrat mb-1">{status.label}</p>
              <p className="text-2xl font-playfair font-bold text-emerald">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-playfair font-bold text-charcoal">
                    Order ORD-{selectedOrder.id.slice(0,8).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500 font-montserrat mt-1">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <a 
                    href={`/admin/orders/${selectedOrder.id}/label`}
                    target="_blank"
                    className="flex items-center space-x-2 bg-charcoal text-white px-4 py-2 rounded-lg font-montserrat text-sm hover:bg-black transition-colors"
                  >
                    <span>Print Label</span>
                  </a>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* 3-Column Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald mb-2">
                      <MapPin className="w-4 h-4" />
                      <h3 className="font-montserrat font-bold text-sm uppercase">Shipping</h3>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.address?.street}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.pincode}</p>
                    <p className="text-sm text-gray-600 mt-2">{selectedOrder.email}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.phone}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald mb-2">
                      <CreditCard className="w-4 h-4" />
                      <h3 className="font-montserrat font-bold text-sm uppercase">Payment</h3>
                    </div>
                    <p className="text-sm text-gray-600">Method: <span className="font-semibold uppercase">{selectedOrder.payment_method}</span></p>
                    <p className="text-sm text-gray-600">Status: <span className="font-semibold text-emerald">{selectedOrder.payment_status}</span></p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Subtotal</span>
                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Discount</span>
                        <span>- {formatPrice(selectedOrder.discount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 mt-2">
                        <span>Total Paid</span>
                        <span className="text-emerald">{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald mb-2">
                      <Package className="w-4 h-4" />
                      <h3 className="font-montserrat font-bold text-sm uppercase">Status</h3>
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                       {statusOptions.find(s => s.value === selectedOrder.status)?.label || selectedOrder.status}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">You can change the status from the main table dropdown.</p>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h3 className="font-montserrat font-bold text-sm uppercase text-gray-500 mb-4 border-b pb-2">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex flex-col p-4 border border-gray-100 rounded-luxury bg-gray-50">
                        <div className="flex space-x-4">
                          <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                            {item.product?.images?.main ? (
                              <img src={item.product.images.main} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs text-center p-2">No Image</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex justify-between">
                            <div>
                              <p className="font-playfair font-bold text-lg text-charcoal">{item.product?.name || 'Deleted Product'}</p>
                              <p className="text-sm font-montserrat text-gray-500 mt-1">Material: {item.product?.material || 'N/A'}</p>
                              <p className="text-sm font-montserrat text-gray-500">Fabric Type: <span className="capitalize">{item.fabric_type}</span></p>
                            </div>
                            <div className="text-right">
                              <p className="font-montserrat font-semibold text-gray-900">{formatPrice(item.unit_price)}</p>
                              <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        </div>

                        {/* Piece Tracking Sub-list */}
                        {item.quantity > 1 && (
                          <div className="mt-3 pl-24 space-y-2 border-t border-gray-200 pt-3">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Individual Piece Tracking</p>
                            {Array.from({ length: item.quantity }).map((_, pIdx) => {
                               const pStatus = (item.piece_statuses && item.piece_statuses[pIdx]) || selectedOrder.status
                               return (
                                 <div key={pIdx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                                    <span className="font-semibold text-charcoal">Piece {pIdx + 1}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(pStatus)}`}>
                                      {statusOptions.find(s => s.value === pStatus)?.label || pStatus}
                                    </span>
                                 </div>
                               )
                            })}
                          </div>
                        )}
                        {(!item.quantity || item.quantity === 1) && (
                          <div className="mt-3 pl-24 pt-3 border-t border-gray-200">
                             <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                                <span className="font-semibold text-gray-500 text-xs">Tracking Status</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor((item.piece_statuses && item.piece_statuses[0]) || selectedOrder.status)}`}>
                                  {statusOptions.find(s => s.value === ((item.piece_statuses && item.piece_statuses[0]) || selectedOrder.status))?.label || ((item.piece_statuses && item.piece_statuses[0]) || selectedOrder.status)}
                                </span>
                             </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
