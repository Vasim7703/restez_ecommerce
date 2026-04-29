'use client'

import { motion } from 'framer-motion'
import { DollarSign, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Revenue',
      value: formatPrice(2450000),
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: '156',
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingCart,
    },
    {
      title: 'Products',
      value: '48',
      change: '+3 new',
      changeType: 'neutral',
      icon: Package,
    },
    {
      title: 'Customers',
      value: '892',
      change: '+15.3%',
      changeType: 'positive',
      icon: Users,
    },
  ]

  const recentOrders = [
    {
      id: 'RST1704567890ABC',
      customer: 'Rahul Sharma',
      product: 'Royal Maharaja 3-Seater',
      amount: 89999,
      status: 'manufacturing',
      date: '2026-04-10',
    },
    {
      id: 'RST1704567891DEF',
      customer: 'Priya Patel',
      product: 'Modern Elegance L-Shape',
      amount: 124999,
      status: 'shipped',
      date: '2026-04-09',
    },
  ]

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    manufacturing: 'bg-blue-100 text-blue-800',
    quality_check: 'bg-purple-100 text-purple-800',
    shipped: 'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-emerald mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 font-montserrat">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-luxury shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald/10 rounded-lg">
                <stat.icon className="w-6 h-6 text-emerald" />
              </div>
              <span
                className={`text-xs font-montserrat font-semibold px-2 py-1 rounded-full ${
                  stat.changeType === 'positive'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-playfair font-bold text-charcoal mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 font-montserrat">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-luxury shadow-md">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-playfair font-bold text-emerald">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-montserrat text-gold hover:text-gold-dark font-semibold"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-montserrat text-emerald font-medium">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-montserrat text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 text-sm font-montserrat text-gray-900">{order.product}</td>
                  <td className="px-6 py-4 text-sm font-montserrat font-semibold text-gray-900">
                    {formatPrice(order.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-montserrat font-semibold rounded-full ${
                        statusColors[order.status as keyof typeof statusColors]
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="bg-gradient-to-br from-emerald to-emerald-light text-white p-6 rounded-luxury shadow-luxury hover:shadow-luxury-lg transition-all group"
        >
          <Package className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-playfair font-bold mb-2">Manage Products</h3>
          <p className="text-sm text-white/90 font-montserrat">
            Add, edit, or remove sofa listings
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-gradient-to-br from-gold to-gold-light text-white p-6 rounded-luxury shadow-luxury hover:shadow-luxury-lg transition-all group"
        >
          <ShoppingCart className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-playfair font-bold mb-2">Manage Orders</h3>
          <p className="text-sm text-white/90 font-montserrat">
            Track manufacturing and delivery
          </p>
        </Link>

        <Link
          href="/admin/coupons"
          className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-luxury shadow-luxury hover:shadow-luxury-lg transition-all group"
        >
          <TrendingUp className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-playfair font-bold mb-2">Create Coupon</h3>
          <p className="text-sm text-white/90 font-montserrat">
            Generate discount codes
          </p>
        </Link>
      </div>
    </div>
  )
}
