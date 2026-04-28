'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success', duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 3500)
    return () => clearTimeout(timer)
  }, [toast, onRemove])

  const styles: Record<ToastType, { bg: string; border: string; icon: ReactNode }> = {
    success: {
      bg: 'bg-white',
      border: 'border-l-4 border-l-emerald-600',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-white',
      border: 'border-l-4 border-l-red-500',
      icon: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-white',
      border: 'border-l-4 border-l-blue-500',
      icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-white',
      border: 'border-l-4 border-l-amber-500',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    },
  }

  const { bg, border, icon } = styles[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-xl ${bg} ${border} w-full`}
    >
      {icon}
      <p className="flex-1 text-sm font-montserrat text-gray-800 font-medium leading-snug">
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
