'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([
    {
      id: 'RST1704567890ABC',
      customer: { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210' },
      product: 'Royal Maharaja 3-Seater',
      amount: 89999,
      status: 'pending',
      date: '2026-04-13',
      address: 'Mumbai, Maharashtra - 400001',
    },
    {
      id: 'RST1704567891DEF',
      customer: { name: 'Priya Patel', email: 'priya@example.com', phone: '+91 98765 43211' },
      product: 'Modern Elegance L-Shape',
      amount: 124999,
      status: 'manufacturing',
      date: '2026-04-10',
      address: 'Ahmedabad, Gujarat - 380001',
    },
    {
      id: 'RST1704567892GHI',
      customer: { name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 98765 43212' },
      product: 'Heritage 2-Seater Loveseat',
      amount: 54999,
      status: 'shipped',
      date: '2026-04-08',
      address: 'Delhi - 110001',
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'manufacturing', label: 'Manufacturing at Artech', color: 'bg-blue-100 text-blue-800' },
    { value: 'quality_check', label: 'Quality Check', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-green-100 text-green-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
  ]

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-playfair font-bold text-emerald mb-2">
          Order Management
        </h1>
        <p className="text-gray-600 font-montserrat">
          Track and manage all customer orders
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
                  Product
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
              {filteredOrders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-montserrat font-semibold text-emerald text-sm">
                        {order.id}
                      </p>
                      <p className="text-xs text-gray-500 font-montserrat mt-1">
                        {new Date(order.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-montserrat font-semibold text-gray-900 text-sm">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-gray-500 font-montserrat mt-1">
                        {order.customer.phone}
                      </p>
                      <p className="text-xs text-gray-500 font-montserrat">
                        {order.address}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-montserrat text-gray-900 text-sm">
                      {order.product}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-montserrat font-semibold text-gray-900">
                      {formatPrice(order.amount)}
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
                      <button className="p-2 hover:bg-emerald/10 rounded-lg transition-colors group">
                        <Eye className="w-4 h-4 text-gray-600 group-hover:text-emerald" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
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
    </div>
  )
}
