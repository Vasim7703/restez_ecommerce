'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, Award, Truck, Shield, Users, RotateCcw, Maximize2, Star } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

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


const trustFeatures = [
  { icon: Award,  title: 'Premium Quality',       description: 'Built by Artech Furniture master artisans' },
  { icon: Truck,  title: 'India-Wide Delivery',   description: 'Reliable and safe shipping' },
  { icon: Shield, title: '5-Year Warranty',        description: 'Complete peace of mind on all products' },
  { icon: Users,  title: '10,000+ Happy Homes',   description: 'Join our family of satisfied customers' },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide]       = useState(0)
  const [modelLoaded, setModelLoaded]          = useState(false)
  const [modelError, setModelError]            = useState(false)
  const [isModelViewerReady, setModelViewerReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // CMS state
  const [heroSlides, setHeroSlides] = useState<any[]>([])
  const [heroInterval, setHeroInterval] = useState(5000)
  const [videoGallery, setVideoGallery] = useState<any[]>([])
  const [cmsLoading, setCmsLoading] = useState(true)
  const [dynamicCollections, setDynamicCollections] = useState<any[]>([])
  useEffect(() => {
    Promise.all([
      fetch('/api/cms?key=homepage_carousel'),
      fetch('/api/cms?key=video_gallery')
    ])
      .then(async ([res1, res3]) => {
        const data1 = await res1.json()
        const data3 = await res3.json()

        if (data1.success && data1.data) {
          setHeroSlides(data1.data.slides || [])
          setHeroInterval(data1.data.interval || 5000)
        }

        if (data3.success && data3.data && data3.data.videos) {
          setVideoGallery(data3.data.videos)
        } else {
          setVideoGallery([
            {
              title: "The bespoke Imperial Chesterfield completely elevated our living room. The craftsmanship is flawless.",
              url: "https://www.youtube.com/watch?v=123",
              thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
            },
            {
              title: "From ordering to the delivery, the experience was premium. The sofa is incredibly comfortable.",
              url: "https://www.youtube.com/watch?v=456",
              thumbnail: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800",
            },
            {
              title: "Finding a piece that blends modern aesthetics with traditional Indian quality was hard, until we found Restez.",
              url: "https://www.youtube.com/watch?v=789",
              thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
            }
          ])
        }
      })
      .catch(err => {
        console.error('Failed to load CMS data', err)
      })
      .finally(() => setCmsLoading(false))
  }, [])

  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const featured = data.filter((p: any) => p.featured)
          const rest = data.filter((p: any) => !p.featured)
          const toShow = [...featured, ...rest]
          setFeaturedProducts(toShow.slice(0, 6))
          
          // Removed heroSlides fallback logic here as per user request
          // so that if they delete all slides from CMS, it doesn't auto-populate with products.
          
          const uniqueCollections = Array.from(new Set(data.map(p => p.collection || p.category))).filter(Boolean)
          const dynamicCols = uniqueCollections.slice(0, 4).map(cName => {
             const product = data.find(p => (p.collection === cName || p.category === cName))
             const images = typeof product?.images === 'string' ? JSON.parse(product.images) : product?.images
             return {
                name: cName,
                description: `Explore our ${cName} collection`,
                image: images?.main || ''
             }
          })
          setDynamicCollections(dynamicCols)
        }
      })
      .catch(() => {})
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
      {heroSlides.length > 0 && (
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
                     {heroSlides[currentSlide]?.image && (
                       <Image 
                         src={heroSlides[currentSlide].image} 
                         alt={heroSlides[currentSlide]?.title || 'Luxury Furniture'}
                         fill
                         priority
                         className="object-cover object-center"
                         sizes="(max-width: 1024px) 100vw, 50vw"
                       />
                     )}
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
      )}


      {/* ── Featured Products (auto-loaded from database) ────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-gold font-montserrat text-xs tracking-[0.35em] uppercase mb-3">Our Collection</p>
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-emerald mb-4">
                Featured Products
              </h2>
              <p className="text-gray-500 font-montserrat max-w-xl mx-auto">
                Premium luxury furniture, ready to transform your living space
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {featuredProducts.map((product, index) => {
                const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
                const mainImg = images?.main || '/sofas/sofa_emerald_velvet.png'
                const avgRating = product.reviews?.length
                  ? product.reviews.reduce((a: number, r: any) => a + r.rating, 0) / product.reviews.length
                  : 0
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-300"
                  >
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                        <Image
                          src={mainImg}
                          alt={product.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {product.featured && (
                          <div className="absolute top-3 left-3 bg-gold text-white text-[10px] font-montserrat font-bold px-2.5 py-1 rounded-full shadow">
                            Featured
                          </div>
                        )}
                        {!product.in_stock && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-montserrat font-bold px-2.5 py-1 rounded-full">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 bg-emerald/10 text-emerald text-[10px] font-montserrat font-semibold rounded-full">{product.category}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-montserrat rounded-full">{product.material}</span>
                        </div>
                        <h3 className="font-playfair font-bold text-lg text-charcoal group-hover:text-emerald transition-colors line-clamp-1 mb-1">
                          {product.name}
                        </h3>
                        {avgRating > 0 && (
                          <div className="flex items-center gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.round(avgRating) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'}`} />
                            ))}
                            <span className="text-[10px] text-gray-400 font-montserrat ml-1">({product.reviews?.length})</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-montserrat text-emerald font-semibold group-hover:underline flex items-center gap-1">
                            View Details <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            <div className="text-center">
              <Link
                href="/products"
                className="inline-flex items-center space-x-2 bg-emerald hover:bg-emerald-light text-white px-8 py-4 rounded-full font-montserrat font-semibold transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <span>View All Products</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

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
            {dynamicCollections.map((collection, index) => (
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
                      <span className="text-xs font-montserrat text-gold">Explore</span>
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
                Hear it from our clients who transformed their living spaces with premium luxury.
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
            {videoGallery.map((video, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative rounded-2xl overflow-hidden shadow-luxury bg-white border border-gray-100 block cursor-pointer"
                onClick={() => window.open(video.url, '_blank')}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  {video.thumbnail && (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-emerald hover:bg-white transition-all hover:scale-110 shadow-xl">
                      <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-gray-700 font-montserrat italic leading-relaxed mb-6">
                    {video.title}
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
              Explore our complete range of premium luxury furniture — each made to order
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
