'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore, MOCK_CUSTOMERS } from '@/lib/store'

export default function SignInPage() {
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showDemo, setShowDemo] = useState(false)


  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      if (user.role === 'admin') router.replace('/admin')
      else router.replace('/')
    }
  }, [mounted, isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403 && data.requireOtp) {
          // In a fully featured app we would redirect to a verify-otp page here
          throw new Error('Account not verified. Please check your email for the OTP.')
        }
        throw new Error(data.error)
      }

      login(data.user)
      if (data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald">
        {/* Jali Pattern */}
        <div className="absolute inset-0 bg-jali-pattern opacity-20" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-dark/80 via-transparent to-gold/20" />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <h1 className="text-4xl font-playfair font-bold text-white tracking-widest">RESTEZ</h1>
            <span className="text-gold text-xs font-montserrat tracking-widest border-l border-gold/40 pl-3">BY ARTECH</span>
          </Link>

          {/* Center content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white"
          >
            <div className="w-16 h-1 bg-gold mb-8" />
            <h2 className="text-5xl font-playfair font-bold mb-6 leading-tight">
              Welcome<br />Back to<br />
              <span className="text-gold">Luxury</span>
            </h2>
            <p className="text-white/70 font-montserrat text-lg leading-relaxed max-w-sm">
              Sign in to your RESTEZ account and continue discovering handcrafted sofas made for Indian homes.
            </p>

            {/* Feature pills */}
            <div className="mt-10 space-y-4">
              {['Track your orders in real-time', 'Save your favorite collections', 'Exclusive member discounts'].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  <span className="text-white/80 font-montserrat text-sm">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom quote */}
          <p className="text-white/40 font-montserrat text-xs">
            © 2024 RESTEZ by Artech Furniture. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="text-3xl font-playfair font-bold text-emerald tracking-widest">RESTEZ</Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-playfair font-bold text-charcoal mb-2">Sign In</h2>
            <p className="text-gray-500 font-montserrat text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-gold font-semibold hover:text-gold-dark transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-luxury"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-montserrat">{error}</p>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button type="button" className="text-sm font-montserrat text-gold hover:text-gold-dark transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-emerald hover:bg-emerald-light disabled:opacity-60 text-white py-4 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury hover:shadow-luxury-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center space-x-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-montserrat">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Admin login link */}
          <Link
            href="/admin/login"
            className="w-full flex items-center justify-center space-x-2 border-2 border-gold/50 hover:border-gold text-gold hover:bg-gold/5 py-3.5 rounded-luxury font-montserrat font-semibold text-sm transition-all"
          >
            <span>Admin Portal Login</span>
          </Link>

          {/* Demo hint — hidden behind toggle */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowDemo(v => !v)}
              className="w-full text-xs font-montserrat text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showDemo ? 'Hide' : 'Show'} demo credentials ›
            </button>
            {showDemo && (
              <div className="mt-2 p-4 bg-emerald/5 border border-emerald/20 rounded-luxury">
                <p className="text-xs font-montserrat text-gray-600 font-semibold mb-1">Demo Credentials:</p>
                <p className="text-xs font-montserrat text-gray-500">Email: arjun@example.com</p>
                <p className="text-xs font-montserrat text-gray-500">Password: customer123</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
