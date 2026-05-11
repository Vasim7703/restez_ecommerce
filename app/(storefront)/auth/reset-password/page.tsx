'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Supabase automatically picks up the #access_token=... fragment and establishes a temporary session
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        // We are ready to accept a new password
        console.log("Ready to recover password")
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Update the user's password using the temporary session established by the email link
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw new Error(error.message)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'Failed to update password')
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
          <h2 className="text-3xl font-playfair font-bold text-charcoal">Create New Password</h2>
          <p className="mt-2 text-sm font-montserrat text-gray-500">
            Please enter your new password below.
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-luxury bg-emerald/10 p-6 text-center border border-emerald/20"
          >
            <CheckCircle className="w-12 h-12 text-emerald mx-auto mb-4" />
            <h3 className="text-lg font-playfair font-bold text-emerald mb-2">Password Updated!</h3>
            <p className="text-sm font-montserrat text-gray-600 mb-6">
              Your password has been successfully changed.
            </p>
            <p className="text-xs font-montserrat text-gray-500">
              Redirecting to login...
            </p>
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all shadow-sm"
                    placeholder="Enter new password"
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

              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-luxury font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all shadow-sm"
                    placeholder="Confirm new password"
                  />
                </div>
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
                    <span>Update Password</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
