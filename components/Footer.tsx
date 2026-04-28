'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-emerald text-white relative overflow-hidden">
      {/* Jali Pattern Background */}
      <div className="absolute inset-0 bg-jali-pattern opacity-30" />
      
      {/* Gold Divider */}
      <div className="relative h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-3xl font-playfair font-bold tracking-wider">
              RESTEZ
            </h3>
            <p className="text-sm text-gold font-montserrat tracking-widest">
              BY ARTECH FURNITURE
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              Handcrafted luxury sofas that blend traditional Indian artistry with contemporary design excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-4 text-gold">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {['Home', 'Collections', 'About Us', 'Contact', 'FAQs'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-white/80 hover:text-gold transition-colors duration-300 font-montserrat"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-4 text-gold">
              Customer Service
            </h4>
            <ul className="space-y-2">
              {['Shipping & Delivery', 'Returns & Exchange', 'Warranty', 'Care Guide', 'Customization'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-white/80 hover:text-gold transition-colors duration-300 font-montserrat"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-4 text-gold">
              Get in Touch
            </h4>
            <div className="space-y-3">
              <a
                href="tel:+919876543210"
                className="flex items-center space-x-3 text-sm text-white/80 hover:text-gold transition-colors group"
              >
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-montserrat">+91 98765 43210</span>
              </a>
              <a
                href="mailto:info@restez.in"
                className="flex items-center space-x-3 text-sm text-white/80 hover:text-gold transition-colors group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-montserrat">info@restez.in</span>
              </a>
              <div className="flex items-start space-x-3 text-sm text-white/80">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="font-montserrat">
                  Artech Furniture Manufacturing Unit<br />
                  Ahmedabad, Gujarat, India
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6 flex space-x-4">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Youtube, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="p-2 bg-white/10 hover:bg-gold rounded-full transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-white/60 font-montserrat">
              © {new Date().getFullYear()} RESTEZ by Artech Furniture. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-white/60 font-montserrat">
              <Link href="#" className="hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-gold transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
