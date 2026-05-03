'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setStatus('success')
    setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-emerald py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-playfair font-bold text-white mb-6"
          >
            Connect with <span className="text-gold italic">Luxury</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-montserrat text-white/80 max-w-2xl mx-auto"
          >
            Whether you're looking for a bespoke design or have a query about our collections, our concierge team is here to assist.
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-12">
            <div>
              <h2 className="text-3xl font-playfair font-bold text-emerald mb-8">Get in Touch</h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-gold/10 p-3 rounded-full text-gold">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-bold text-charcoal">Flagship Gallery</h3>
                    <p className="text-gray-500 font-montserrat text-sm mt-1">
                      Plot No. 45, Artech Avenue, <br />
                      Industrial Area Phase II, <br />
                      Jodhpur, Rajasthan - 342001
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gold/10 p-3 rounded-full text-gold">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-bold text-charcoal">Concierge Service</h3>
                    <p className="text-gray-500 font-montserrat text-sm mt-1">
                      +91 98765 43210 <br />
                      Mon - Sat: 10:00 AM - 7:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gold/10 p-3 rounded-full text-gold">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-bold text-charcoal">Email Us</h3>
                    <p className="text-gray-500 font-montserrat text-sm mt-1">
                      concierge@restez.in <br />
                      support@artechfurniture.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-emerald/5 rounded-luxury border border-emerald/10">
              <div className="flex items-center space-x-3 text-emerald mb-4">
                <MessageSquare className="w-6 h-6" />
                <h3 className="font-playfair font-bold text-lg">Bespoke Design</h3>
              </div>
              <p className="text-sm font-montserrat text-gray-600 leading-relaxed">
                Looking for something truly unique? Our designers can work with you to create custom furniture tailored to your specific space and style.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-luxury shadow-luxury-lg border border-gray-100">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-montserrat font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald outline-none font-montserrat transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-montserrat font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald outline-none font-montserrat transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-montserrat font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald outline-none font-montserrat transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-montserrat font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald outline-none font-montserrat transition-all"
                  >
                    <option>General Inquiry</option>
                    <option>Bespoke Design</option>
                    <option>Order Tracking</option>
                    <option>Bulk/Business Inquiry</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-montserrat font-bold text-gray-400 uppercase tracking-widest">Your Message</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="How can we help you today?"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald outline-none font-montserrat transition-all resize-none"
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button
                    disabled={status !== 'idle'}
                    type="submit"
                    className={`w-full md:w-auto px-10 py-4 font-montserrat font-bold rounded-luxury flex items-center justify-center space-x-2 transition-all shadow-lg ${
                      status === 'success' 
                        ? 'bg-emerald text-white' 
                        : 'bg-gold text-white hover:bg-gold-light hover:shadow-gold-glow'
                    }`}
                  >
                    {status === 'sending' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : status === 'success' ? (
                      <span>Message Sent Successfully</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[400px] w-full bg-gray-100 relative grayscale hover:grayscale-0 transition-all duration-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-emerald mx-auto mb-4" />
            <p className="font-playfair font-bold text-xl text-emerald">Visit Our Gallery</p>
            <p className="text-sm font-montserrat text-gray-500 mt-2">Jodhpur, Rajasthan</p>
          </div>
        </div>
        {/* In a real app, you would embed a Google Map here */}
        <div className="absolute inset-0 bg-emerald/5 pointer-events-none" />
      </section>
    </div>
  )
}
