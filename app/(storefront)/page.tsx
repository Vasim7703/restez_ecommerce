'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, Award, Truck, Shield, Users, RotateCcw, Maximize2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string; alt?: string; 'auto-rotate'?: boolean | string;
        'camera-controls'?: boolean | string; 'shadow-intensity'?: string;
        exposure?: string; ar?: boolean | string; 'ar-modes'?: string;
        'rotation-per-second'?: string; style?: React.CSSProperties;
      }, HTMLElement>
    }
  }
}

// Removed static heroSlides - now fetching from CMS

// Removed static fabricShowcase - now fetching from CMS

const collections = [
  {
    name: 'Royal Heritage',
    description: 'Traditional designs with ornate carvings',
    image: '/sofas/sofa_emerald_velvet.png',
    count: 12,
  },
  {
    name: 'Imperial',
    description: 'Chesterfield luxury, Indian craftsmanship',
    image: '/sofas/chesterfield_navy.png',
    count: 8,
  },
  {
    name: 'Mughal Series',
    description: 'Ornate loveseats, bridal elegance',
    image: '/sofas/loveseat_rose_pink.png',
    count: 6,
  },
  {
    name: 'Contemporary',
    description: 'Clean lines, modern aesthetics',
    image: '/sofas/sofa_charcoal_grey.png',
    count: 18,
  },
]

const trustFeatures = [
  { icon: Award,  title: 'Premium Quality',       description: 'Handcrafted by Artech Furniture master artisans' },
  { icon: Truck,  title: 'India-Wide Delivery',   description: 'Free shipping on orders above ₹50,000' },
  { icon: Shield, title: '5-Year Warranty',        description: 'Complete peace of mind on all products' },
  { icon: Users,  title: '10,000+ Happy Homes',   description: 'Join our family of satisfied customers' },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide]       = useState(0)
  const [activeFabric, setActiveFabric]        = useState(0)
  const [modelLoaded, setModelLoaded]          = useState(false)
  const [modelError, setModelError]            = useState(false)
  const [isModelViewerReady, setModelViewerReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // CMS state (pre-filled with default to prevent gray box during load)
  const [heroSlides, setHeroSlides] = useState<any[]>([
    {
      title: 'Royal Heritage Collection',
      subtitle: 'Timeless Elegance Meets Modern Comfort',
      image: '/sofas/sofa_emerald_velvet.png',
      cta: 'Explore Collection',
      link: '/products'
    }
  ])
  const [heroInterval, setHeroInterval] = useState(5000)
  const [fabrics, setFabrics] = useState<any[]>([
    { name: 'Emerald Velvet',   img: '/sofas/sofa_emerald_velvet.png',   color: '#1a6b4a' },
    { name: 'Burgundy Velvet',  img: '/sofas/sofa_burgundy_velvet.png',  color: '#7c1f38' },
    { name: 'Navy Blue Velvet', img: '/sofas/sofa_navy_velvet.png',      color: '#1a2f6b' },
    { name: 'Gold Silk',        img: '/sofas/sofa_gold_silk.png',        color: '#b5860d' },
    { name: 'Charcoal Grey',    img: '/sofas/sofa_charcoal_grey.png',    color: '#3d3d3d' },
    { name: 'Royal Purple',     img: '/sofas/sofa_royal_purple.png',     color: '#6b21a8' },
    { name: 'Ivory Cream',      img: '/sofas/sofa_ivory_cream.png',      color: '#c8b48a' },
    { name: 'Terracotta',       img: '/sofas/sofa_terracotta.png',       color: '#c1440e' },
  ])
  const [cmsLoading, setCmsLoading] = useState(true)

  // Fetch CMS Data
  useEffect(() => {
    Promise.all([
      fetch('/api/cms?key=homepage_carousel'),
      fetch('/api/cms?key=homepage_fabrics')
    ])
      .then(async ([res1, res2]) => {
        const data1 = await res1.json()
        const data2 = await res2.json()

        if (data1.success && data1.data) {
          setHeroSlides(data1.data.slides || [])
          setHeroInterval(data1.data.interval || 5000)
        } else {
          // Fallback if no CMS data exists yet
          setHeroSlides([
            {
              title: 'Royal Heritage Collection',
              subtitle: 'Timeless Elegance Meets Modern Comfort',
              image: '/sofas/sofa_emerald_velvet.png',
              cta: 'Explore Collection',
              link: '/products'
            }
          ])
        }

        if (data2.success && data2.data && data2.data.length > 0) {
          setFabrics(data2.data)
        }
      })
      .catch(err => {
        console.error('Failed to load CMS data', err)
      })
      .finally(() => setCmsLoading(false))
  }, [])

  // Hero auto-advance
  useEffect(() => {
    if (heroSlides.length <= 1) return
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % heroSlides.length), heroInterval)
    return () => clearInterval(t)
  }, [heroSlides.length, heroInterval])



  // Load model-viewer web component script
  useEffect(() => {
    if (document.querySelector('script[data-model-viewer]')) {
      setModelViewerReady(true)
      return
    }
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
    script.setAttribute('data-model-viewer', 'true')
    script.onload = () => setModelViewerReady(true)
    script.onerror = () => setModelError(true)
    document.head.appendChild(script)
  }, [])

  return (
    <div className="bg-white">
      {/* ── Editorial Hero Slider ────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] bg-[#FCFCFA] flex items-center overflow-hidden pt-28 pb-16">
        {/* Subtle background texture/glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left: Typography & Controls */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center relative">
               <AnimatePresence>
                 <motion.div
                   key={`text-${currentSlide}`}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -30, position: 'absolute' }}
                   transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                   className="relative z-10 flex flex-col justify-center w-full"
                 >
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-px bg-gold"></div>
                      <span className="text-gold font-montserrat text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold">RESTEZ · BY ARTECH</span>
                    </div>
                    <h2 className="text-5xl sm:text-6xl lg:text-[5rem] font-playfair font-bold text-[#1A1A1A] leading-[1.1] mb-6">
                      {heroSlides[currentSlide]?.title}
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-500 font-montserrat leading-relaxed mb-10 max-w-lg">
                      {heroSlides[currentSlide]?.subtitle}
                    </p>
                    <div>
                      <Link
                        href={heroSlides[currentSlide]?.link || '/products'}
                        className="inline-flex items-center space-x-3 bg-[#1A1A1A] hover:bg-emerald text-white px-8 py-4 rounded-full font-montserrat font-semibold transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group"
                      >
                        <span>{heroSlides[currentSlide]?.cta}</span>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-emerald transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </Link>
                    </div>
                 </motion.div>
               </AnimatePresence>
               
               {/* Custom Slider Controls */}
               <div className="flex items-center space-x-4 mt-12 lg:mt-16 relative z-20">
                 {heroSlides.map((_, index) => (
                    <button
                      key={`dot-${index}`}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        index === currentSlide ? 'bg-gold w-12' : 'bg-gray-300 w-4 hover:bg-gray-400'
                      }`}
                    />
                 ))}
               </div>
            </div>

            {/* Right: Editorial Image Container */}
            <div className="w-full lg:w-1/2 relative h-[400px] sm:h-[500px] lg:h-[700px]">
               <AnimatePresence mode="popLayout">
                 <motion.div
                   key={`img-${currentSlide}`}
                   initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                   animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                   exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                   transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                   className="absolute inset-0 z-10 pointer-events-auto"
                 >
                   <div className="w-full h-full rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl relative bg-gray-100">
                     <img 
                       src={heroSlides[currentSlide]?.image} 
                       alt={heroSlides[currentSlide]?.title}
                       className="absolute inset-0 w-full h-full object-cover object-center"
                     />
                     {/* Subtle inner shadow for depth */}
                     <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem] lg:rounded-[3rem]" />
                   </div>
                 </motion.div>
               </AnimatePresence>
               
               {/* Decorative background shape to ground the image */}
               <div className="absolute -z-10 -bottom-6 -right-6 w-3/4 h-3/4 bg-gold/20 rounded-[3rem] blur-2xl transition-opacity duration-700" />
            </div>

          </div>
        </div>
      </section>

      {/* ── 3D / Interactive Sofa Showcase ─────────────────────────── */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#0d1f1a] to-[#0a1710] overflow-hidden relative">
        {/* Decorative bokeh circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <p className="text-gold font-montserrat text-xs tracking-[0.35em] uppercase mb-3">Interactive Preview</p>
            <h2 className="text-3xl md:text-5xl font-playfair font-bold text-white mb-3">
              Choose Your Fabric
            </h2>
            <p className="text-white/60 font-montserrat text-base max-w-xl mx-auto">
              Every sofa is available in 8 premium fabrics. Watch it transform in real time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: 3D model-viewer or photo showcase */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Glow ring */}
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-30 transition-colors duration-700"
                style={{ backgroundColor: fabrics[activeFabric]?.color }}
              />

              <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3]">
                {/* Premium animated photo carousel */}
                <div className="relative w-full h-full overflow-hidden group">
                  <AnimatePresence>
                    <motion.img
                      key={`fabric-img-${activeFabric}`}
                      src={fabrics[activeFabric]?.img}
                      alt={fabrics[activeFabric]?.name}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  {/* Floating badge */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-montserrat font-semibold px-3 py-1.5 rounded-full border border-white/20 z-10">
                    ✦ {fabrics[activeFabric]?.name}
                  </div>
                  
                  {/* Animated Progress Bar */}
                  {fabrics.length > 0 && (
                    <motion.div
                      key={`progress-${activeFabric}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3.5, ease: "linear" }}
                      onAnimationComplete={() => setActiveFabric(p => (p + 1) % fabrics.length)}
                      className="absolute bottom-0 left-0 h-1 bg-gold z-20 shadow-[0_0_10px_rgba(200,180,138,0.8)]"
                    />
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right: fabric swatch picker */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <h3 className="text-2xl font-playfair font-bold text-white mb-2">
                {fabrics[activeFabric]?.name}
              </h3>
              <p className="text-white/50 font-montserrat text-sm mb-6">
                Tap any swatch to preview the fabric. Visit a product page to customise and order.
              </p>

              {/* Swatch grid */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {fabrics.map((fab, i) => (
                  <button
                    key={fab.name}
                    onClick={() => setActiveFabric(i)}
                    title={fab.name}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      i === activeFabric
                        ? 'border-gold scale-105 shadow-lg shadow-gold/30'
                        : 'border-white/10 hover:border-white/40 hover:scale-105'
                    }`}
                  >
                    <img src={fab.img} alt={fab.name} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1.5 transition-opacity ${i === activeFabric ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <span className="text-[9px] text-white font-montserrat font-semibold leading-tight">{fab.name}</span>
                    </div>
                    {i === activeFabric && (
                      <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-gold rounded-full shadow-md" />
                    )}
                  </button>
                ))}
              </div>

              {/* Colour dot strip */}
              <div className="flex items-center gap-2 mb-8">
                {fabrics.map((fab, i) => (
                  <button
                    key={fab.name}
                    onClick={() => setActiveFabric(i)}
                    className={`rounded-full border-2 transition-all duration-300 ${
                      i === activeFabric ? 'w-8 h-5 border-gold' : 'w-5 h-5 border-transparent hover:border-white/40'
                    }`}
                    style={{ backgroundColor: fab.color }}
                    title={fab.name}
                  />
                ))}
              </div>

              <Link
                href="/products"
                className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-light text-white px-7 py-3.5 rounded-luxury font-montserrat font-semibold transition-all duration-300 shadow-luxury hover:shadow-gold-glow group"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Collections Grid ────────────────────────────────────────── */}
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

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Link
                  href={`/products`}
                  className="group block relative overflow-hidden rounded-luxury shadow-luxury hover:shadow-luxury-lg transition-all duration-500"
                >
                  <div className="aspect-[4/3] sm:aspect-[3/4] overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url(${collection.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                    <h3 className="text-xl sm:text-2xl font-playfair font-bold mb-1 group-hover:text-gold transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-montserrat text-white/80 mb-2 hidden sm:block">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-montserrat text-gold">{collection.count} Products</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistics / Numbers Section ────────────────────────────── */}
      <section className="py-24 bg-emerald text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-playfair font-bold">
              Let our numbers do the talking!
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 text-center md:divide-x divide-white/20">
            <div className="px-4">
              <div className="text-5xl md:text-6xl font-playfair font-bold text-gold mb-3">10000+</div>
              <div className="text-sm md:text-base font-montserrat text-white/80 uppercase tracking-widest">Happy Homes</div>
            </div>
            <div className="px-4">
              <div className="text-5xl md:text-6xl font-playfair font-bold text-gold mb-3">50+</div>
              <div className="text-sm md:text-base font-montserrat text-white/80 uppercase tracking-widest">Master Artisans</div>
            </div>
            <div className="px-4">
              <div className="text-5xl md:text-6xl font-playfair font-bold text-gold mb-3">15+</div>
              <div className="text-sm md:text-base font-montserrat text-white/80 uppercase tracking-widest">Years Legacy</div>
            </div>
            <div className="px-4">
              <div className="text-5xl md:text-6xl font-playfair font-bold text-gold mb-3">100%</div>
              <div className="text-sm md:text-base font-montserrat text-white/80 uppercase tracking-widest">Premium Quality</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Video Testimonials Section ─────────────────────────────── */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-4">
                See Why 10,000+ Homeowners Choose RESTEZ
              </h2>
              <p className="text-lg text-gray-600 font-montserrat">
                Hear it from our clients who transformed their living spaces with handcrafted luxury.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link
                href="/products"
                className="inline-flex items-center space-x-2 bg-charcoal hover:bg-emerald text-white px-8 py-3.5 rounded-full font-montserrat font-semibold transition-colors shadow-lg"
              >
                <span>Book a Free Consultation</span>
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The bespoke Imperial Chesterfield completely elevated our living room. The craftsmanship is flawless and beyond our expectations.",
                names: "Arjun & Priya, Delhi",
                img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
              },
              {
                quote: "From ordering to the white-glove delivery, the experience was premium. The sofa is incredibly comfortable and looks stunning.",
                names: "Neha Sharma, Mumbai",
                img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800",
              },
              {
                quote: "Finding a piece that blends modern aesthetics with traditional Indian quality was hard, until we found Restez.",
                names: "Vikram & Ananya, Bangalore",
                img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative rounded-2xl overflow-hidden shadow-luxury bg-white border border-gray-100"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img src={testimonial.img} alt="Client Home" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-emerald hover:bg-white transition-all hover:scale-110 shadow-xl">
                      <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-gray-700 font-montserrat italic leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>
                  <p className="text-emerald font-semibold font-montserrat text-sm uppercase tracking-wider">
                    {testimonial.names}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Section ───────────────────────────────────────────── */}
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

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {trustFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gold/20 rounded-full mb-4">
                  <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-gold" />
                </div>
                <h3 className="text-lg sm:text-xl font-playfair font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-white/80 font-montserrat">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────── */}
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
              Explore our complete range of handcrafted luxury sofas — each made to order
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
