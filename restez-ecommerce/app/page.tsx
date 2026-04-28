'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Award, Truck, Shield, Users } from 'lucide-react'
import { useState, useEffect } from 'react'

const heroSlides = [
  {
    title: 'Royal Heritage Collection',
    subtitle: 'Timeless Elegance Meets Modern Comfort',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    cta: 'Explore Collection',
  },
  {
    title: 'Contemporary Luxury',
    subtitle: 'Crafted for Modern Indian Homes',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1600&q=80',
    cta: 'Shop Now',
  },
  {
    title: 'Bespoke Craftsmanship',
    subtitle: 'Every Piece, A Masterpiece',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1600&q=80',
    cta: 'Discover More',
  },
]

const collections = [
  {
    name: 'Royal Heritage',
    description: 'Traditional designs with ornate carvings',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    count: 12,
  },
  {
    name: 'Contemporary',
    description: 'Clean lines, modern aesthetics',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80',
    count: 18,
  },
  {
    name: 'Classic Elegance',
    description: 'Timeless sophistication',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80',
    count: 15,
  },
  {
    name: 'L-Shape Sectionals',
    description: 'Perfect for spacious living rooms',
    image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600&q=80',
    count: 8,
  },
]

const trustFeatures = [
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Handcrafted by Artech Furniture master artisans',
  },
  {
    icon: Truck,
    title: 'India-Wide Delivery',
    description: 'Free shipping on orders above ₹50,000',
  },
  {
    icon: Shield,
    title: '5-Year Warranty',
    description: 'Complete peace of mind on all products',
  },
  {
    icon: Users,
    title: '10,000+ Happy Homes',
    description: 'Join our family of satisfied customers',
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-white">
      {/* Hero Slider */}
      <section className="relative h-[80vh] md:h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentSlide ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
            style={{ pointerEvents: index === currentSlide ? 'auto' : 'none' }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-2xl"
              >
                <h2 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-4 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-xl md:text-2xl text-gold font-montserrat mb-8">
                  {slide.subtitle}
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-light text-white px-8 py-4 rounded-luxury font-montserrat font-semibold transition-all duration-300 shadow-luxury hover:shadow-gold-glow group"
                >
                  <span>{slide.cta}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-gold w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-20 bg-gradient-to-b from-white to-emerald/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-emerald mb-4 gold-divider inline-block">
              Shop by Collection
            </h2>
            <p className="mt-6 text-lg text-gray-600 font-montserrat max-w-2xl mx-auto">
              Each collection tells a story of craftsmanship, heritage, and timeless design
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Link
                  href={`/products?collection=${collection.name.toLowerCase().replace(' ', '-')}`}
                  className="group block relative overflow-hidden rounded-luxury shadow-luxury hover:shadow-luxury-lg transition-all duration-500"
                >
                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url(${collection.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-playfair font-bold mb-2 group-hover:text-gold transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-sm font-montserrat text-white/90 mb-3">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-montserrat text-gold">
                        {collection.count} Products
                      </span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-emerald text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-jali-pattern opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
              The Artech Difference
            </h2>
            <p className="text-lg text-gold font-montserrat">
              Manufactured with pride at Artech Furniture
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/20 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-playfair font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/80 font-montserrat">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gold/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-emerald mb-6">
              Ready to Transform Your Living Space?
            </h2>
            <p className="text-lg text-gray-600 font-montserrat mb-8">
              Explore our complete range of handcrafted luxury sofas
            </p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-emerald hover:bg-emerald-light text-white px-10 py-5 rounded-luxury font-montserrat font-semibold text-lg transition-all duration-300 shadow-luxury hover:shadow-luxury-lg group"
            >
              <span>View All Collections</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
