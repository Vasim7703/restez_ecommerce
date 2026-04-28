'use client'

import { useAuthStore } from '@/lib/store'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Package, MapPin, User, LogOut } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (mounted && (!isAuthenticated || !user)) {
      router.push('/auth/signin?redirect=/dashboard/orders')
    }
  }, [mounted, isAuthenticated, user, router])

  if (!mounted || !user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    { name: 'My Orders', href: '/dashboard/orders', icon: Package },
    { name: 'My Addresses', href: '/dashboard/addresses', icon: MapPin },
    { name: 'Profile Settings', href: '/dashboard/profile', icon: User },
  ]

  return (
    <div className="bg-gray-50 min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-charcoal flex items-center space-x-3">
            <span>Welcome, {user.name}</span>
          </h1>
          <p className="text-gray-500 font-montserrat mt-2">Manage your luxury pieces and account settings.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-luxury shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6 bg-emerald/5 border-b border-gray-100 flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald rounded-full flex items-center justify-center text-white text-xl font-bold font-montserrat shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-montserrat font-bold text-charcoal">{user.name}</p>
                  <p className="text-xs text-gray-500 font-montserrat">{user.email}</p>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-luxury font-montserrat font-semibold transition-colors ${
                        isActive 
                          ? 'bg-emerald text-white shadow-md' 
                          : 'text-gray-600 hover:bg-emerald/5 hover:text-emerald'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-luxury font-montserrat font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="bg-white rounded-luxury shadow-sm border border-gray-100 min-h-[500px] overflow-hidden">
              {children}
            </div>
          </main>
        </div>

      </div>
    </div>
  )
}
