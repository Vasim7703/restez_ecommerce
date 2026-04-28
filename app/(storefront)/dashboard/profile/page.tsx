'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { User, Phone, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user, login } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.email) {
      // Fetch fresh data
      fetch(`/api/user/profile?email=${user.email}`)
        .then(r => r.json())
        .then(data => {
          if (!data.error) {
            setForm(prev => ({ ...prev, name: data.name || '', phone: data.phone || '' }))
          }
        })
    }
  }, [user?.email])

  const update = (field: string, val: string) => setForm(p => ({ ...p, [field]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match')
    }
    if (form.newPassword && form.newPassword.length < 6) {
      return setError('New password must be at least 6 characters')
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          name: form.name,
          phone: form.phone,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSuccess('Profile updated successfully')
      setForm(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }))
      
      // Update local store
      if (user) {
        login({ ...user, name: data.user.name })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-playfair font-bold text-charcoal mb-6">Profile Settings</h2>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-luxury flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5" /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-luxury flex items-center space-x-3 text-sm">
            <CheckCircle2 className="w-5 h-5" /><span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" value={form.name} onChange={e => update('name', e.target.value)} required
                className="w-full pl-10 pr-4 py-3 border rounded-luxury focus:ring-2 focus:ring-emerald outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="tel" value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3 border rounded-luxury focus:ring-2 focus:ring-emerald outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Email Address (Cannot be changed)</label>
          <input 
            type="email" value={user?.email || ''} disabled
            className="w-full px-4 py-3 border rounded-luxury bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-playfair font-bold text-charcoal mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" value={form.currentPassword} onChange={e => update('currentPassword', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-luxury focus:ring-2 focus:ring-emerald outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">New Password</label>
                <input 
                  type="password" value={form.newPassword} onChange={e => update('newPassword', e.target.value)}
                  className="w-full px-4 py-3 border rounded-luxury focus:ring-2 focus:ring-emerald outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                <input 
                  type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 border rounded-luxury focus:ring-2 focus:ring-emerald outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full md:w-auto px-8 py-3 bg-emerald text-white rounded-luxury font-semibold hover:bg-emerald-light transition-colors"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

      </form>
    </div>
  )
}
