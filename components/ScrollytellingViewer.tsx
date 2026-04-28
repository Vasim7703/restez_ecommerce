'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScrollytellingSection {
  id: string
  title: string
  content: string
  image: string
}

interface ScrollytellingViewerProps {
  sections: ScrollytellingSection[]
  /** RGBA color string e.g. 'rgba(0,100,60,0.55)' — applied as mix-blend-mode:multiply overlay so only the dark sofa fabric is tinted, not the white background */
  fabricOverlayColor?: string | null
}

export default function ScrollytellingViewer({ sections, fabricOverlayColor }: ScrollytellingViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const observerRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    observerRefs.current.forEach((ref, index) => {
      if (!ref) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index)
            }
          })
        },
        {
          root: null,
          rootMargin: '-40% 0px -40% 0px',
          threshold: 0,
        }
      )

      observer.observe(ref)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [sections])

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Sticky Image Container */}
        <div className="lg:sticky lg:top-24 h-[60vh] lg:h-[80vh] self-start">
          <div className="relative w-full h-full rounded-luxury overflow-hidden shadow-luxury-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                {/* Base image */}
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${sections[activeIndex]?.image})` }}
                />

                {/* Fabric colour overlay — mix-blend-mode:multiply only darkens/tints
                    pixels proportional to their darkness. White walls stay white. */}
                {fabricOverlayColor && (
                  <motion.div
                    key={fabricOverlayColor}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: fabricOverlayColor,
                      mixBlendMode: 'multiply',
                    }}
                  />
                )}

                {/* Image Label */}
                <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-sm p-4 rounded-luxury">
                  <p className="text-white font-montserrat text-sm">
                    View: <span className="text-gold font-semibold">{sections[activeIndex]?.title}</span>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Indicator */}
            <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-white font-montserrat text-sm">
                {activeIndex + 1} / {sections.length}
              </p>
            </div>

            {/* Fabric colour dot indicator */}
            {fabricOverlayColor && (
              <div className="absolute top-6 left-6 flex items-center space-x-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white/60 flex-shrink-0"
                  style={{ backgroundColor: fabricOverlayColor }}
                />
                <span className="text-white font-montserrat text-xs">Fabric Preview</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-32 py-8">
          {sections.map((section, index) => (
            <div
              key={section.id}
              ref={(el) => {
                observerRefs.current[index] = el
              }}
              className="min-h-[40vh] flex items-center"
            >
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-20%' }}
                transition={{ duration: 0.6 }}
                className={`p-8 rounded-luxury transition-all duration-500 ${
                  activeIndex === index
                    ? 'bg-emerald/5 border-2 border-gold/30 shadow-luxury'
                    : 'bg-white border-2 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-playfair font-bold text-lg transition-all duration-300 ${
                    activeIndex === index
                      ? 'bg-gold text-white scale-110'
                      : 'bg-emerald/10 text-emerald'
                  }`}>
                    {index + 1}
                  </div>
                  <h3 className={`text-2xl font-playfair font-bold transition-colors duration-300 ${
                    activeIndex === index ? 'text-emerald' : 'text-charcoal'
                  }`}>
                    {section.title}
                  </h3>
                </div>

                <div className="pl-13">
                  <p className="text-gray-700 font-montserrat leading-relaxed text-lg">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
