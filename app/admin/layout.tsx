'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tag,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isLoginPage = pathname === '/admin/login'
  const isAdmin = session?.user && (session.user as { role?: string }).role === 'admin'

  // Redirect non-admins away from all admin routes except /admin/login
  useEffect(() => {
    if (status === 'loading') return
    if (!isLoginPage && !isAdmin) {
      router.replace('/admin/login')
    }
  }, [status, isAdmin, isLoginPage, router])

  // On the login page — render only the login form, NO sidebar/topbar
  if (isLoginPage) {
    return <>{children}</>
  }

  // While session is loading, show nothing (avoids flashing sidebar)
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not authenticated — redirect is in progress, show nothing
  if (!isAdmin) return null

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    { name: 'Site Content', href: '/admin/cms', icon: LayoutDashboard },
  ]

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 print:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            <Link href="/admin" className="flex items-center space-x-2">
              <h1 className="text-2xl font-playfair font-bold text-emerald">
                RESTEZ
              </h1>
              <span className="text-xs text-gold font-montserrat tracking-widest">
                ADMIN
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Logged-in user */}
            <span className="hidden sm:block text-sm font-montserrat text-gray-500">
              {session.user?.name || session.user?.email}
            </span>
            <Link
              href="/"
              className="text-sm font-montserrat text-gray-600 hover:text-emerald"
            >
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm font-montserrat text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-emerald text-white overflow-y-auto print:hidden">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-montserrat transition-all ${
                  isActive
                    ? 'bg-gold text-white shadow-gold-glow'
                    : 'text-white/80 hover:bg-emerald-light hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="text-center text-white/60 text-xs font-montserrat">
            <p>Manufactured by</p>
            <p className="text-gold font-semibold">Artech Furniture</p>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden print:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-16 bottom-0 w-64 bg-emerald text-white overflow-y-auto z-50 lg:hidden print:hidden"
            >
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-emerald-light rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-montserrat transition-all ${
                        isActive
                          ? 'bg-gold text-white shadow-gold-glow'
                          : 'text-white/80 hover:bg-emerald-light hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen print:ml-0 print:pt-0">
        {children}
      </main>
    </div>
  )
}
