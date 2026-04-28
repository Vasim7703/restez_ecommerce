'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuthStore, MOCK_CUSTOMERS } from '@/lib/store'
import Link from 'next/link'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void // Called after successful login — e.g. proceed to checkout
  message?: string       // Optional context message like "Login to proceed to checkout"
}

export default function AuthModal({ isOpen, onClose, onSuccess, message }: AuthModalProps) {
  const { login } = useAuthStore()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  // --- Sign In State ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [signinError, setSigninError] = useState('')
  const [signinLoading, setSigninLoading] = useState(false)

  // --- Sign Up State ---
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [signupError, setSignupError] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const resetState = () => {
    setEmail(''); setPassword(''); setSigninError(''); setShowPassword(false)
    setSignupName(''); setSignupEmail(''); setSignupPassword(''); setSignupError(''); setSignupSuccess(false); setShowSignupPassword(false)
    setTab('signin')
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSigninError('')
    setSigninLoading(true)
    await new Promise(r => setTimeout(r, 700))

    // Try API first, fall back to mock customers
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const data = await res.json()
        login({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role })
        handleClose()
        onSuccess?.()
        setSigninLoading(false)
        return
      }
    } catch {}

    // Fallback to mock customers
    const found = MOCK_CUSTOMERS.find(c => c.email === email && c.password === password)
    if (found) {
      login({ id: found.id, name: found.name, email: found.email, role: found.role })
      handleClose()
      onSuccess?.()
    } else {
      setSigninError('Invalid email or password. Please try again.')
    }
    setSigninLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('')
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setSignupError('All fields are required.')
      return
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.')
      return
    }
    setSignupLoading(true)
    await new Promise(r => setTimeout(r, 800))

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        login({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role })
        setSignupSuccess(true)
        setTimeout(() => {
          handleClose()
          onSuccess?.()
        }, 1200)
      } else {
        setSignupError(data.error || 'Sign up failed. Please try again.')
      }
    } catch {
      setSignupError('Network error. Please check your connection.')
    }
    setSignupLoading(false)
  }

  const inputCls = 'w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all placeholder-gray-400'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative">

              {/* Header Bar */}
              <div className="relative bg-emerald-900 px-6 pt-8 pb-6">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #D4AF37 0%, transparent 60%), radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 60%)' }}
                />
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="relative text-2xl font-playfair font-bold text-white mb-1">
                  {tab === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h2>
                {message && (
                  <p className="relative text-white/70 font-montserrat text-sm">{message}</p>
                )}

                {/* Tabs */}
                <div className="relative flex mt-5 bg-black/20 rounded-xl p-1 space-x-1">
                  {(['signin', 'signup'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setSigninError(''); setSignupError('') }}
                      className={`flex-1 py-2 rounded-lg text-sm font-montserrat font-semibold transition-all ${
                        tab === t
                          ? 'bg-white text-emerald-900'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {t === 'signin' ? 'Sign In' : 'Sign Up'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Area */}
              <div className="px-6 py-6">

                {/* SIGN IN FORM */}
                <AnimatePresence mode="wait">
                  {tab === 'signin' && (
                    <motion.form
                      key="signin"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSignIn}
                      className="space-y-4"
                    >
                      {signinError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <p className="text-sm text-red-700 font-montserrat">{signinError}</p>
                        </div>
                      )}

                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email" value={email} onChange={e => setEmail(e.target.value)}
                          required placeholder="Email address"
                          className={inputCls}
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)} required
                          placeholder="Password"
                          className={`${inputCls} pr-11`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <button
                        type="submit" disabled={signinLoading}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-montserrat font-semibold transition-all shadow-md"
                      >
                        {signinLoading
                          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                        }
                      </button>

                      <p className="text-center text-xs text-gray-500 font-montserrat">
                        Don&apos;t have an account?{' '}
                        <button type="button" onClick={() => setTab('signup')}
                          className="text-amber-600 font-semibold hover:underline">
                          Sign up free
                        </button>
                      </p>
                    </motion.form>
                  )}

                  {/* SIGN UP FORM */}
                  {tab === 'signup' && (
                    <motion.form
                      key="signup"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSignUp}
                      className="space-y-4"
                    >
                      {signupSuccess ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center py-6 text-center"
                        >
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-9 h-9 text-green-600" />
                          </div>
                          <p className="text-lg font-playfair font-bold text-emerald-800">Account created!</p>
                          <p className="text-sm text-gray-500 font-montserrat mt-1">Signing you in...</p>
                        </motion.div>
                      ) : (
                        <>
                          {signupError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <p className="text-sm text-red-700 font-montserrat">{signupError}</p>
                            </div>
                          )}

                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text" value={signupName} onChange={e => setSignupName(e.target.value)}
                              required placeholder="Full name"
                              className={inputCls}
                            />
                          </div>

                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                              required placeholder="Email address"
                              className={inputCls}
                            />
                          </div>

                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type={showSignupPassword ? 'text' : 'password'} value={signupPassword}
                              onChange={e => setSignupPassword(e.target.value)} required
                              placeholder="Create a password (min 6 chars)"
                              className={`${inputCls} pr-11`}
                            />
                            <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          <button
                            type="submit" disabled={signupLoading}
                            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white py-3.5 rounded-xl font-montserrat font-semibold transition-all shadow-md"
                          >
                            {signupLoading
                              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
                            }
                          </button>

                          <p className="text-center text-xs text-gray-500 font-montserrat">
                            Already have an account?{' '}
                            <button type="button" onClick={() => setTab('signin')}
                              className="text-emerald-700 font-semibold hover:underline">
                              Sign in
                            </button>
                          </p>
                        </>
                      )}
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 pb-5">
                <p className="text-center text-[11px] text-gray-400 font-montserrat">
                  By continuing, you agree to RESTEZ&apos;s{' '}
                  <span className="underline cursor-pointer hover:text-gray-600">Terms</span> &amp;{' '}
                  <span className="underline cursor-pointer hover:text-gray-600">Privacy Policy</span>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
