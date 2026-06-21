"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode, useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { ToastProvider } from "@/components/Toast"

export function Providers({ children }: { children: ReactNode }) {
  const { checkSession, updateLastActive } = useAuthStore()

  useEffect(() => {
    // Check session on mount
    checkSession()

    // Periodically check session every minute
    const intervalId = setInterval(() => {
      checkSession()
    }, 60000)

    // Activity tracker for standard user interactions
    const handleActivity = () => {
      updateLastActive()
    }

    // Throttle the event listeners to avoid excessive state updates
    let timeoutId: NodeJS.Timeout | null = null
    const throttledActivity = () => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          handleActivity()
          timeoutId = null
        }, 60000) // update at most once a minute
      }
    }

    window.addEventListener("mousemove", throttledActivity)
    window.addEventListener("keydown", throttledActivity)
    window.addEventListener("scroll", throttledActivity)
    window.addEventListener("click", throttledActivity)

    return () => {
      window.removeEventListener("mousemove", throttledActivity)
      window.removeEventListener("keydown", throttledActivity)
      window.removeEventListener("scroll", throttledActivity)
      window.removeEventListener("click", throttledActivity)
      if (timeoutId) clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [checkSession, updateLastActive])

  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  )
}
