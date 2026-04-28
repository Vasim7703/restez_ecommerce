'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, Search, User, LogOut, ChevronDown, ShieldCheck, Heart } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useCartStore, useAuthStore, useWishlistStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/supabase'

export default function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const itemCount = useCartStore((state) => state.getItemCount())
  const wishlistItemCount = useWishlistStore((state) => state.items.length)
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => { 
    setMounted(true) 
    fetch('/api/products').then(res => res.json()).then(setProducts).catch(console.error)
  }, [])

  const searchResults = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4)

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      setSearchFocused(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Collections', href: '/products' },
    { name: 'About Artech', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gold/20 shadow-luxury">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
              <h1 className="relative text-3xl font-playfair font-bold text-emerald tracking-wider">
                RESTEZ
              </h1>
            </div>
            <div className="hidden md:block text-xs text-gold font-montserrat tracking-widest">
              BY ARTECH
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-montserrat font-medium text-charcoal hover:text-emerald transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right Icons & Search */}
          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <div className="relative hidden lg:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search luxury..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className={`w-64 pl-10 pr-4 py-2 border rounded-full font-montserrat text-sm transition-all outline-none focus:ring-2 focus:ring-emerald ${
                    searchFocused ? 'border-emerald shadow-sm bg-white' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>

              {/* Auto-suggest dropdown */}
              <AnimatePresence>
                {searchFocused && searchQuery.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-luxury shadow-luxury-lg overflow-hidden z-50"
                  >
                    {searchResults.length > 0 ? (
                      <div className="py-2">
                        <p className="px-4 py-1 text-xs font-montserrat font-semibold text-gray-400 uppercase tracking-wider">Top Results</p>
                        {searchResults.map(p => (
                          <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            onClick={() => setSearchFocused(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-emerald/5 transition-colors"
                          >
                            <div className="w-10 h-10 bg-cover bg-center rounded-lg flex-shrink-0" style={{ backgroundImage: `url(${p.images.main})` }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-montserrat font-semibold text-charcoal truncate">{p.name}</p>
                              <p className="text-xs text-gray-500 font-montserrat truncate">{p.category}</p>
                            </div>
                          </Link>
                        ))}
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full text-center px-4 py-3 border-t border-gray-50 text-sm font-montserrat font-semibold text-emerald hover:bg-emerald/5 transition-colors"
                        >
                          See all results for "{searchQuery}"
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm font-montserrat text-gray-500">No products found.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Icon (Just redirects to search page) */}
            <Link href="/search" className="lg:hidden p-2 hover:bg-gold/10 rounded-full transition-colors">
              <Search className="w-5 h-5 text-charcoal" />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 hover:bg-gold/10 rounded-full transition-colors group"
            >
              <Heart className="w-5 h-5 text-charcoal group-hover:text-red-500 transition-colors" />
              {mounted && wishlistItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white"
                >
                  {wishlistItemCount}
                </motion.span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-gold/10 rounded-full transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 text-charcoal group-hover:text-emerald transition-colors" />
              {mounted && itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-gold-glow"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* Auth Section — Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              {mounted && isAuthenticated && user ? (
                /* Logged-in user dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-luxury hover:bg-gold/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center text-white text-sm font-bold font-montserrat">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-montserrat font-medium text-charcoal max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-luxury shadow-luxury-lg overflow-hidden z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 bg-emerald/5 border-b border-gray-100">
                          <p className="text-sm font-montserrat font-semibold text-charcoal truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 font-montserrat truncate">{user.email}</p>
                          {user.role === 'admin' && (
                            <span className="inline-flex items-center space-x-1 mt-1 text-xs text-gold font-montserrat font-semibold">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Admin</span>
                            </span>
                          )}
                        </div>

                        <div className="py-1">
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-sm font-montserrat text-charcoal hover:bg-gold/5 hover:text-gold transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          <Link
                            href="/dashboard/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm font-montserrat text-charcoal hover:bg-emerald/5 hover:text-emerald transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>My Orders</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-montserrat text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Sign In / Sign Up buttons */
                <div className="flex items-center space-x-2">
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-montserrat font-semibold text-emerald border-2 border-emerald hover:bg-emerald hover:text-white rounded-luxury transition-all duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-montserrat font-semibold text-white bg-gold hover:bg-gold-light rounded-luxury transition-all duration-300 shadow-md hover:shadow-gold-glow"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gold/10 rounded-full transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-charcoal" />
              ) : (
                <Menu className="w-6 h-6 text-charcoal" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gold/20 bg-white"
          >
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-3 text-base font-montserrat font-medium text-charcoal hover:text-emerald hover:bg-emerald/5 rounded-luxury transition-all duration-300"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-3 border-t border-gray-100 space-y-2">
                {mounted && isAuthenticated && user ? (
                  <>
                    <div className="px-3 py-2 bg-emerald/5 rounded-luxury">
                      <p className="text-sm font-montserrat font-semibold text-charcoal">{user.name}</p>
                      <p className="text-xs text-gray-500 font-montserrat">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 py-3 px-3 text-base font-montserrat font-medium text-charcoal hover:text-emerald hover:bg-emerald/5 rounded-luxury"
                    >
                      <User className="w-5 h-5" />
                      <span>My Orders</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 py-3 px-3 text-base font-montserrat font-medium text-gold hover:bg-gold/5 rounded-luxury"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                      className="w-full flex items-center space-x-2 py-3 px-3 text-base font-montserrat font-medium text-red-500 hover:bg-red-50 rounded-luxury"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-3 text-base font-montserrat font-semibold text-emerald border-2 border-emerald text-center rounded-luxury"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-3 text-base font-montserrat font-semibold text-white bg-gold text-center rounded-luxury"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
