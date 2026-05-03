
'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, Search, User } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Collections', href: '/products' },
    { name: 'About Artech', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

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

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gold/10 rounded-full transition-colors">
              <Search className="w-5 h-5 text-charcoal" />
            </button>

            <Link
              href="/admin"
              className="hidden md:block p-2 hover:bg-gold/10 rounded-full transition-colors"
            >
              <User className="w-5 h-5 text-charcoal" />
            </Link>

            <Link
              href="/cart"
              className="relative p-2 hover:bg-gold/10 rounded-full transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 text-charcoal group-hover:text-emerald transition-colors" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-gold-glow"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

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
            <nav className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-montserrat font-medium text-charcoal hover:text-emerald hover:pl-4 transition-all duration-300"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-montserrat font-medium text-charcoal hover:text-emerald hover:pl-4 transition-all duration-300"
              >
                Admin Portal
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
