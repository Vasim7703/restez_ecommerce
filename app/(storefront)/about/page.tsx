'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Award, Users } from 'lucide-react'

const features = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-gold" />,
    title: 'Uncompromising Quality',
    description: 'Each piece is crafted using the finest Teak and Sheesham wood, ensuring longevity that spans generations.'
  },
  {
    icon: <Award className="w-8 h-8 text-gold" />,
    title: 'Artisan Heritage',
    description: 'Our master craftsmen carry forward centuries-old Rajasthani carving techniques, blended with modern ergonomics.'
  },
  {
    icon: <Zap className="w-8 h-8 text-gold" />,
    title: 'Modern Innovation',
    description: 'From 3D previews to smart fabric technology, we bring the future of luxury furniture to your home.'
  },
  {
    icon: <Users className="w-8 h-8 text-gold" />,
    title: 'Customer Centric',
    description: 'Bespoke designs tailored to your unique taste, with a dedicated concierge service for every client.'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: 'url("/sofas/sofa_lifestyle_room.png")', filter: 'brightness(0.4)' }}
        />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-playfair font-bold text-white mb-6"
          >
            The Art of <span className="text-gold italic">Restez</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl font-montserrat text-white/90 leading-relaxed"
          >
            Where traditional Indian craftsmanship meets the pinnacle of modern luxury living.
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-playfair font-bold text-emerald mb-8 italic">The Artech Heritage</h2>
            <div className="space-y-6 text-gray-600 font-montserrat leading-relaxed">
              <p>
                Founded by Artech Furniture, RESTEZ was born from a singular vision: to redefine the Indian luxury furniture landscape. Our name, derived from the French word for "stay", invites you to linger in comfort and elegance.
              </p>
              <p>
                For decades, our artisans have been the silent architects behind some of India's most prestigious interiors. Every sofa we create is a symphony of meticulously seasoned wood, hand-picked upholstery, and an obsessive attention to detail that only a master artisan can provide.
              </p>
              <p>
                We don't just build furniture; we create heirlooms. From the intricate carvings of our Royal Heritage collection to the sleek lines of our Contemporary series, RESTEZ represents a legacy of excellence.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-[500px] rounded-luxury overflow-hidden shadow-luxury-lg"
          >
            <img 
              src="/sofas/sofa_emerald_velvet.png" 
              alt="Craftsmanship" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gold/10 mix-blend-overlay" />
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-emerald mb-4">Why Choose RESTEZ?</h2>
            <p className="text-gray-500 font-montserrat">The pillars of our commitment to excellence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-luxury shadow-sm hover:shadow-luxury transition-all duration-300 border border-gray-100"
              >
                <div className="mb-6 bg-gold/5 w-16 h-16 flex items-center justify-center rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-playfair font-bold text-charcoal mb-4">{feature.title}</h3>
                <p className="text-gray-500 font-montserrat text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-playfair font-bold text-emerald mb-8">Ready to transform your home?</h2>
          <p className="text-lg font-montserrat text-gray-600 mb-10">
            Explore our collections and experience the true meaning of handcrafted luxury.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/products" 
              className="px-8 py-4 bg-emerald text-white font-montserrat font-bold rounded-luxury hover:bg-emerald-light transition-all shadow-lg hover:shadow-emerald/20"
            >
              Explore Collections
            </a>
            <a 
              href="/contact" 
              className="px-8 py-4 border-2 border-emerald text-emerald font-montserrat font-bold rounded-luxury hover:bg-emerald hover:text-white transition-all"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
