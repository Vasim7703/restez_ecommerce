'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { mockProducts } from '@/lib/mockData'
import { formatPrice } from '@/lib/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleStock = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, in_stock: !p.in_stock } : p
    ))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-emerald mb-2">
            Products
          </h1>
          <p className="text-gray-600 font-montserrat">
            Manage your sofa inventory
          </p>
        </div>

        <button className="inline-flex items-center space-x-2 bg-emerald hover:bg-emerald-light text-white px-6 py-3 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury">
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-luxury shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-luxury font-montserrat focus:outline-none focus:ring-2 focus:ring-emerald"
          />
        </div>
      </div>

      <div className="bg-white rounded-luxury shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Stock
                </th>
                <th className="px-6 py-4 text-right text-xs font-montserrat font-semibold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-16 h-16 bg-cover bg-center rounded-lg"
                        style={{ backgroundImage: `url(${product.images.main})` }}
                      />
                      <div>
                        <p className="font-montserrat font-semibold text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 font-montserrat">
                          {product.material}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-montserrat font-semibold">
                    {formatPrice(product.base_price)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStock(product.id)}
                      className={`px-3 py-1 text-xs font-montserrat font-semibold rounded-full ${
                        product.in_stock
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 hover:bg-emerald/10 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
