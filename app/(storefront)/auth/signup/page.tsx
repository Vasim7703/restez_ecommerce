'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function SignUpPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuthStore()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [otp, setOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (mounted && isAuthenticated) router.replace('/')
  }, [mounted, isAuthenticated, router])

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return { score: 0, label: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
    return { score, label: labels[score], color: colors[score] }
  }

  const strength = passwordStrength(form.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)
      
      setShowOtp(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResendMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)
      
      login(data.user)
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setResendMessage('')
    setResending(true)

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)
      
      setResendMessage('A new verification code has been sent!')
      setOtp('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald">
        <div className="absolute inset-0 bg-jali-pattern opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-dark/80 via-transparent to-gold/20" />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <Link href="/" className="flex items-center space-x-3">
            <h1 className="text-4xl font-playfair font-bold text-white tracking-widest">RESTEZ</h1>
            <span className="text-gold text-xs font-montserrat tracking-widest border-l border-gold/40 pl-3">BY ARTECH</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white"
          >
            <div className="w-16 h-1 bg-gold mb-8" />
            <h2 className="text-5xl font-playfair font-bold mb-6 leading-tight">
              Join the<br />World of<br />
              <span className="text-gold">Royal Comfort</span>
            </h2>
            <p className="text-white/70 font-montserrat text-lg leading-relaxed max-w-sm">
              Create your RESTEZ account and get access to exclusive collections, personalised recommendations, and early sale alerts.
            </p>

            {/* Benefits */}
            <div className="mt-10 space-y-4">
              {[
                'Exclusive member-only offers',
                'Easy order tracking & returns',
                'Personalised sofa recommendations',
                'AR room visualiser access',
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-gold" />
                  </div>
                  <span className="text-white/80 font-montserrat text-sm">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <p className="text-white/40 font-montserrat text-xs">
            © 2024 RESTEZ by Artech Furniture. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="text-3xl font-playfair font-bold text-emerald tracking-widest">RESTEZ</Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-playfair font-bold text-charcoal mb-2">Create Account</h2>
            <p className="text-gray-500 font-montserrat text-sm">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-gold font-semibold hover:text-gold-dark transition-colors">Sign in</Link>
            </p>
          </div>

          {showOtp ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
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
              
              {resendMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3 p-4 bg-emerald/10 border border-emerald/20 rounded-luxury mb-4"
                >
                  <Check className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-dark font-montserrat">{resendMessage}</p>
                </motion.div>
              )}
              
              <div className="text-center mb-6">
                <p className="text-gray-600 font-montserrat">
                  We've sent a 6-digit verification code to<br/>
                  <span className="font-semibold text-charcoal">{form.email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2 text-center">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="------"
                  className="w-full text-center tracking-[1em] text-2xl py-4 bg-white border border-gray-200 rounded-luxury font-montserrat focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center space-x-2 bg-emerald hover:bg-emerald-light disabled:opacity-60 text-white py-4 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury hover:shadow-luxury-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Account</span>
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <div className="text-center space-y-3">
                <button 
                  type="button" 
                  onClick={handleResendOtp} 
                  disabled={resending}
                  className="text-sm text-emerald hover:text-emerald-dark font-semibold transition-colors disabled:opacity-50"
                >
                  {resending ? 'Sending...' : "Didn't receive it? Resend OTP"}
                </button>
                <div className="block">
                  <button type="button" onClick={() => setShowOtp(false)} className="text-xs text-gray-500 hover:text-gray-800">
                    Wrong email? Go back
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              {/* Full Name */}
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                    placeholder="Your full name"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="+91 98765 43210"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    required
                    placeholder="Create a strong password"
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
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-montserrat mt-1">{strength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                    required
                    placeholder="Re-enter your password"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all shadow-sm ${
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  />
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-500 font-montserrat">
                By creating an account, you agree to our{' '}
                <span className="text-gold font-semibold cursor-pointer">Terms of Service</span> and{' '}
                <span className="text-gold font-semibold cursor-pointer">Privacy Policy</span>.
              </p>

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
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
