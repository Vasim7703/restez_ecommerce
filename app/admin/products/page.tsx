'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon, Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/lib/supabase'

const emptyForm = {
  name: '', slug: '', description: '',
  base_price: '', premium_upcharge: '',
  category: 'Sofa', collection: '', material: '', style: '',
  seating_capacity: '3',
  dim_length: '', dim_width: '', dim_height: '',
  standard_fabrics: 'Emerald Velvet, Burgundy Velvet',
  premium_fabrics: 'Gold Silk Brocade, Royal Purple Silk',
  img_main: '', img_front: '', img_angle: '', img_side: '', img_back: '', img_closeup: '',
  in_stock: true, featured: false,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [fabricImages, setFabricImages] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'fabrics'>('basic')

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openAdd = () => {
    setForm(emptyForm)
    setFabricImages({})
    setEditProduct(null)
    setActiveTab('basic')
    setShowModal(true)
  }

  const openEdit = (product: Product) => {
    setEditProduct(product)
    setFabricImages(product.fabric_images || {})
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      base_price: String(product.base_price),
      premium_upcharge: String(product.premium_upcharge),
      category: product.category,
      collection: product.collection,
      material: product.material,
      style: product.style,
      seating_capacity: String(product.seating_capacity),
      dim_length: String(product.dimensions.length),
      dim_width: String(product.dimensions.width),
      dim_height: String(product.dimensions.height),
      standard_fabrics: product.fabric_options.standard.join(', '),
      premium_fabrics: product.fabric_options.premium.join(', '),
      img_main: product.images.main,
      img_front: product.images.front,
      img_angle: product.images.angle_45,
      img_side: product.images.side,
      img_back: product.images.back,
      img_closeup: product.images.closeup,
      in_stock: product.in_stock,
      featured: product.featured,
    })
    setActiveTab('basic')
    setShowModal(true)
  }

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSave = async () => {
    const mainImg = form.img_main || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'
    const newProductData = {
      name: form.name,
      slug: form.slug || autoSlug(form.name),
      description: form.description,
      base_price: Number(form.base_price) || 0,
      premium_upcharge: Number(form.premium_upcharge) || 0,
      category: form.category,
      collection: form.collection,
      material: form.material,
      style: form.style,
      seating_capacity: Number(form.seating_capacity) || 3,
      dimensions: {
        length: Number(form.dim_length) || 0,
        width: Number(form.dim_width) || 0,
        height: Number(form.dim_height) || 0,
      },
      fabric_options: {
        standard: form.standard_fabrics.split(',').map(s => s.trim()).filter(Boolean),
        premium: form.premium_fabrics.split(',').map(s => s.trim()).filter(Boolean),
      },
      images: {
        main: mainImg,
        front: form.img_front || mainImg,
        angle_45: form.img_angle || mainImg,
        side: form.img_side || mainImg,
        back: form.img_back || mainImg,
        closeup: form.img_closeup || mainImg,
        lifestyle: [mainImg],
      },
      fabric_images: fabricImages,
      in_stock: form.in_stock,
      featured: form.featured,
    }

    try {
      if (editProduct) {
        const res = await fetch(`/api/products/${editProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProductData),
        })
        if (!res.ok) throw new Error('Failed to update')
        const updated = await res.json()
        setProducts(products.map(p => p.id === editProduct.id ? updated : p))
      } else {
        const res = await fetch(`/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newProductData, id: String(Date.now()) }),
        })
        if (!res.ok) throw new Error('Failed to create')
        const created = await res.json()
        setProducts([...products, created])
      }

      setSaved(true)
      setTimeout(() => { setSaved(false); setShowModal(false) }, 1200)
    } catch (err) {
      console.error(err)
      alert("Failed to save product")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete')
        setProducts(products.filter(p => p.id !== id))
      } catch (err) {
        console.error(err)
        alert("Failed to delete product")
      }
    }
  }

  const toggleStock = async (id: string) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, in_stock: !product.in_stock }),
      })
      if (!res.ok) throw new Error('Failed to toggle stock')
      const updated = await res.json()
      setProducts(products.map(p => p.id === id ? updated : p))
    } catch (err) {
      console.error(err)
      alert("Failed to update stock status")
    }
  }

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald bg-white'
  const labelCls = 'block text-xs font-montserrat font-semibold text-gray-600 mb-1'

  if (loading) {
    return (
      <div className="p-6 text-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mx-auto mb-4"></div>
        <p className="text-xl font-playfair text-charcoal">Loading catalog...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-emerald mb-1">Products</h1>
          <p className="text-gray-500 font-montserrat text-sm">{products.length} products in inventory</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center space-x-2 bg-emerald hover:bg-emerald-light text-white px-6 py-3 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-luxury shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-luxury font-montserrat focus:outline-none focus:ring-2 focus:ring-emerald"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-luxury shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-xs font-montserrat font-semibold text-gray-700 uppercase">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-montserrat font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-16 h-16 bg-cover bg-center rounded-lg flex-shrink-0"
                        style={{ backgroundImage: `url(${product.images.main})` }}
                      />
                      <div>
                        <p className="font-montserrat font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500 font-montserrat">{product.material} · {product.seating_capacity} Seater</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-montserrat font-semibold">{formatPrice(product.base_price)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStock(product.id)}
                      className={`px-3 py-1 text-xs font-montserrat font-semibold rounded-full ${product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => openEdit(product)} className="p-2 hover:bg-emerald/10 rounded-lg">
                        <Edit className="w-4 h-4 text-emerald" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-playfair font-bold text-emerald">
                  {editProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {(['basic', 'images', 'fabrics'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-montserrat font-semibold capitalize transition-colors ${activeTab === tab
                      ? 'text-emerald border-b-2 border-emerald'
                      : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {tab === 'basic' ? '📝 Details' : tab === 'images' ? '🖼️ Images' : '🎨 Fabrics'}
                  </button>
                ))}
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5">

                {/* TAB: Basic Details */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className={labelCls}>Product Name *</label>
                        <input value={form.name} onChange={e => { set('name', e.target.value); set('slug', autoSlug(e.target.value)) }} placeholder="E.g. Royal Maharaja 3-Seater" className={inputCls} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>URL Slug (auto-generated)</label>
                        <input value={form.slug} onChange={e => set('slug', e.target.value)} className={`${inputCls} text-gray-400`} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Description *</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe the sofa..." className={`${inputCls} resize-none`} />
                      </div>
                      <div>
                        <label className={labelCls}>Base Price (₹) *</label>
                        <input type="number" value={form.base_price} onChange={e => set('base_price', e.target.value)} placeholder="89999" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Premium Fabric Upcharge (₹)</label>
                        <input type="number" value={form.premium_upcharge} onChange={e => set('premium_upcharge', e.target.value)} placeholder="25000" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Category *</label>
                        <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
                          <option value="Sofa">Sofa (3-Seater)</option>
                          <option value="Loveseat">Loveseat (2-Seater)</option>
                          <option value="Chesterfield">Chesterfield</option>
                          <option value="L-Shape Sofa">L-Shape Sofa</option>
                          <option value="Sectional">Sectional Sofa</option>
                          <option value="Lounger">Lounger / Chaise Lounge</option>
                          <option value="Sofa Cum Bed">Sofa Cum Bed</option>
                          <option value="Recliner">Recliner</option>
                          <option value="Daybed">Daybed</option>
                          <option value="Chair">Chair / Accent Chair</option>
                          <option value="Ottoman">Ottoman / Pouf</option>
                          <option value="Bench">Bench / Settee</option>
                          <option value="Side Table">Side Table</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Collection</label>
                        <input value={form.collection} onChange={e => set('collection', e.target.value)} placeholder="Royal Heritage" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Material</label>
                        <select value={form.material} onChange={e => set('material', e.target.value)} className={inputCls}>
                          <option value="">Select material</option>
                          <option>Sheesham Wood</option>
                          <option>Teak Wood</option>
                          <option>Mango Wood</option>
                          <option>Mahogany Wood</option>
                          <option>Plywood</option>
                          <option>MDF</option>
                          <option>Metal Frame</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Style</label>
                        <select value={form.style} onChange={e => set('style', e.target.value)} className={inputCls}>
                          <option value="">Select style</option>
                          <option>Traditional</option>
                          <option>Modern</option>
                          <option>Contemporary</option>
                          <option>Classic</option>
                          <option>Transitional</option>
                          <option>Scandinavian</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Seating Capacity</label>
                        <select value={form.seating_capacity} onChange={e => set('seating_capacity', e.target.value)} className={inputCls}>
                          {[1, 2, 3, 5, 6].map(n => <option key={n} value={n}>{n} Seater</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label className={labelCls}>Dimensions (cm)</label>
                      <div className="grid grid-cols-3 gap-3">
                        <input type="number" value={form.dim_length} onChange={e => set('dim_length', e.target.value)} placeholder="Length" className={inputCls} />
                        <input type="number" value={form.dim_width} onChange={e => set('dim_width', e.target.value)} placeholder="Width" className={inputCls} />
                        <input type="number" value={form.dim_height} onChange={e => set('dim_height', e.target.value)} placeholder="Height" className={inputCls} />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center space-x-6 pt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <div onClick={() => set('in_stock', !form.in_stock)} className={`w-10 h-6 rounded-full transition-colors ${form.in_stock ? 'bg-emerald' : 'bg-gray-300'} relative`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.in_stock ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                        <span className="text-sm font-montserrat font-semibold text-gray-600">In Stock</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <div onClick={() => set('featured', !form.featured)} className={`w-10 h-6 rounded-full transition-colors ${form.featured ? 'bg-gold' : 'bg-gray-300'} relative`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                        <span className="text-sm font-montserrat font-semibold text-gray-600">Featured</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB: Images */}
                {activeTab === 'images' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 font-montserrat bg-emerald/5 border border-emerald/20 p-3 rounded-luxury">
                      💡 Paste image URLs for each view. If you only have one photo, paste the same URL in all fields — the scrollytelling will still work correctly as it labels each section.
                    </p>
                    {[
                      { field: 'img_main', label: 'Main Image (thumbnail & hero) *' },
                      { field: 'img_front', label: 'Front View' },
                      { field: 'img_angle', label: '45° Angle View' },
                      { field: 'img_side', label: 'Side View' },
                      { field: 'img_back', label: 'Back View' },
                      { field: 'img_closeup', label: 'Close-up / Detail View' },
                    ].map(({ field, label }) => (
                      <div key={field}>
                        <label className={labelCls}>{label}</label>
                        <div className="flex space-x-2">
                          <input
                            value={(form as any)[field]}
                            onChange={e => set(field, e.target.value)}
                            placeholder="https://..."
                            className={`${inputCls} flex-1`}
                          />
                          {(form as any)[field] && (
                            <div
                              className="w-10 h-10 rounded-lg bg-cover bg-center border border-gray-200 flex-shrink-0"
                              style={{ backgroundImage: `url(${(form as any)[field]})` }}
                            />
                          )}
                          {!(form as any)[field] && (
                            <div className="w-10 h-10 rounded-lg border border-dashed border-gray-200 flex-shrink-0 flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB: Fabrics */}
                {activeTab === 'fabrics' && (() => {
                  const allFabrics = [
                    ...form.standard_fabrics.split(',').map(s => s.trim()).filter(Boolean).map(n => ({ name: n, tier: 'Standard' as const })),
                    ...form.premium_fabrics.split(',').map(s => s.trim()).filter(Boolean).map(n => ({ name: n, tier: 'Premium' as const })),
                  ]
                  return (
                    <div className="space-y-5">

                      {/* Standard fabrics input */}
                      <div>
                        <label className={labelCls}>Standard Fabric Names <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                        <textarea
                          value={form.standard_fabrics}
                          onChange={e => set('standard_fabrics', e.target.value)}
                          rows={2}
                          placeholder="Emerald Velvet, Burgundy Velvet, Navy Blue Velvet"
                          className={`${inputCls} resize-none`}
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {form.standard_fabrics.split(',').filter(s => s.trim()).map(s => (
                            <span key={s} className="inline-block bg-emerald/10 text-emerald text-xs px-2 py-0.5 rounded-full">{s.trim()}</span>
                          ))}
                        </div>
                      </div>

                      {/* Premium fabrics input */}
                      <div>
                        <label className={labelCls}>Premium Fabric Names <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                        <textarea
                          value={form.premium_fabrics}
                          onChange={e => set('premium_fabrics', e.target.value)}
                          rows={2}
                          placeholder="Gold Silk Brocade, Royal Purple Silk"
                          className={`${inputCls} resize-none`}
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {form.premium_fabrics.split(',').filter(s => s.trim()).map(s => (
                            <span key={s} className="inline-block bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">{s.trim()}</span>
                          ))}
                        </div>
                      </div>

                      {/* Per-fabric image section — shows only when fabrics are defined */}
                      {allFabrics.length > 0 && (
                        <div className="border-t border-gray-100 pt-5">
                          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                            <ImageIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-montserrat font-bold text-blue-700">Fabric-Specific Product Images</p>
                              <p className="text-xs font-montserrat text-blue-600 mt-0.5 leading-relaxed">
                                Paste the image URL for each fabric below. When a customer selects that fabric on the product page, they will see the exact photo — no colour filter.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {allFabrics.map(({ name, tier }) => (
                              <div key={name} className="group">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs font-montserrat font-bold px-2 py-0.5 rounded-full ${
                                    tier === 'Premium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald/10 text-emerald'
                                  }`}>{tier}</span>
                                  <label className="text-sm font-montserrat font-semibold text-charcoal">{name}</label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="url"
                                    value={fabricImages[name] || ''}
                                    onChange={e => setFabricImages(prev => ({ ...prev, [name]: e.target.value }))}
                                    placeholder="https://... (paste image URL for this fabric colour)"
                                    className={`${inputCls} flex-1 text-sm`}
                                  />
                                  {/* Live preview thumbnail */}
                                  {fabricImages[name] ? (
                                    <div
                                      className="w-14 h-10 rounded-lg bg-cover bg-center border-2 border-emerald/30 flex-shrink-0 shadow-sm"
                                      style={{ backgroundImage: `url(${fabricImages[name]})` }}
                                      title={`Preview: ${name}`}
                                    />
                                  ) : (
                                    <div className="w-14 h-10 rounded-lg border-2 border-dashed border-gray-200 flex-shrink-0 flex items-center justify-center bg-gray-50">
                                      <ImageIcon className="w-4 h-4 text-gray-300" />
                                    </div>
                                  )}
                                  {/* Clear button */}
                                  {fabricImages[name] && (
                                    <button
                                      onClick={() => setFabricImages(prev => { const n = { ...prev }; delete n[name]; return n })}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                      title="Clear image"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Summary: how many images filled */}
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald h-full rounded-full transition-all duration-500"
                                style={{ width: `${allFabrics.length ? (Object.values(fabricImages).filter(Boolean).length / allFabrics.length) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-montserrat text-gray-500 flex-shrink-0">
                              {Object.values(fabricImages).filter(Boolean).length} / {allFabrics.length} images added
                            </span>
                          </div>
                        </div>
                      )}

                      {allFabrics.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                          <p className="text-sm font-montserrat">Add fabric names above to unlock per-fabric image uploads</p>
                        </div>
                      )}

                    </div>
                  )
                })()}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex space-x-2">
                  {(['basic', 'images', 'fabrics'] as const).map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`w-2 h-2 rounded-full transition-colors ${activeTab === tab ? 'bg-emerald' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-luxury text-sm font-montserrat font-semibold text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!form.name || !form.base_price}
                    className="px-6 py-2.5 bg-emerald hover:bg-emerald-light disabled:opacity-50 text-white rounded-luxury text-sm font-montserrat font-semibold transition-all flex items-center space-x-2"
                  >
                    {saved ? <><Check className="w-4 h-4" /><span>Saved!</span></> : <><span>{editProduct ? 'Save Changes' : 'Add Product'}</span></>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
