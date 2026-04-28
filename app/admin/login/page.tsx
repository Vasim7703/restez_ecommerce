'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect to admin if already logged in as admin
  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      router.replace('/admin')
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { signIn } = await import('next-auth/react')
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError('Invalid admin credentials. Please check your email and password.')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-jali-pattern opacity-5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-charcoal-light border border-gold/20 rounded-2xl overflow-hidden shadow-2xl">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

          <div className="p-10">
            {/* Logo + badge */}
            <div className="text-center mb-10">
              <Link href="/" className="inline-block">
                <h1 className="text-3xl font-playfair font-bold text-white tracking-widest mb-1">RESTEZ</h1>
                <p className="text-gold text-xs font-montserrat tracking-widest">BY ARTECH</p>
              </Link>

              <div className="mt-6 inline-flex items-center space-x-2 bg-gold/10 border border-gold/30 text-gold px-5 py-2 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm font-montserrat font-semibold">Admin Portal</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-playfair font-bold text-white mb-2">Admin Sign In</h2>
              <p className="text-white/50 font-montserrat text-sm">
                Restricted access. Authorised personnel only.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-luxury"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 font-montserrat">{error}</p>
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-montserrat font-semibold text-white/70 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="admin@restez.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-luxury font-montserrat text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-montserrat font-semibold text-white/70 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter admin password"
                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-luxury font-montserrat text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold disabled:opacity-60 text-white py-4 rounded-luxury font-montserrat font-semibold transition-all shadow-gold-glow mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Access Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gold/5 border border-gold/20 rounded-luxury">
              <p className="text-xs font-montserrat text-gold/70 font-semibold mb-1">Demo Admin Credentials:</p>
              <p className="text-xs font-montserrat text-white/50">Email: admin@restez.com</p>
              <p className="text-xs font-montserrat text-white/50">Password: admin@restez123</p>
            </div>

            {/* Back to site */}
            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="text-sm font-montserrat text-white/40 hover:text-white/70 transition-colors"
              >
                ← Back to Customer Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Security note */}
        <p className="mt-4 text-center text-xs text-white/20 font-montserrat">
          🔒 This area is monitored and protected. Unauthorised access attempts are logged.
        </p>
      </motion.div>
    </div>
  )
}
