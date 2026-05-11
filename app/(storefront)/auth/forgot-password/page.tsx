'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-luxury shadow-luxury"
      >
        <div className="text-center">
          <Link href="/" className="text-3xl font-playfair font-bold text-emerald tracking-widest block mb-4">RESTEZ</Link>
          <h2 className="text-3xl font-playfair font-bold text-charcoal">Reset Password</h2>
          <p className="mt-2 text-sm font-montserrat text-gray-500">
            Enter your email and we'll send you a link or OTP to reset your password.
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-luxury bg-emerald/10 p-6 text-center border border-emerald/20"
          >
            <CheckCircle className="w-12 h-12 text-emerald mx-auto mb-4" />
            <h3 className="text-lg font-playfair font-bold text-emerald mb-2">Check your email</h3>
            <p className="text-sm font-montserrat text-gray-600 mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <button
              onClick={() => {
                setSuccess(false)
                setEmail('')
              }}
              className="text-sm font-montserrat font-semibold text-emerald hover:text-emerald-light transition-colors"
            >
              Try another email
            </button>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

            <div>
              <label htmlFor="email" className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-emerald hover:bg-emerald-light disabled:opacity-60 text-white py-4 rounded-luxury font-montserrat font-semibold transition-all shadow-luxury hover:shadow-luxury-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <Link href="/auth/signin" className="text-sm font-montserrat text-gray-500 hover:text-emerald font-semibold transition-colors">
                &larr; Back to sign in
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
