import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'RESTEZ - Luxury Indian Sofas by Artech Furniture',
  description: 'Handcrafted luxury sofas blending traditional Indian artistry with contemporary design. Premium teak and sheesham wood furniture manufactured by Artech Furniture.',
  keywords: 'luxury sofas, Indian furniture, Artech Furniture, handcrafted sofas, teak wood, sheesham wood',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#004d40',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
