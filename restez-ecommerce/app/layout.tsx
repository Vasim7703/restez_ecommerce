import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

export const metadata: Metadata = {
  title: 'RESTEZ - Luxury Indian Sofas by Artech Furniture',
  description: 'Handcrafted luxury sofas blending traditional Indian artistry with contemporary design. Premium teak and sheesham wood furniture manufactured by Artech Furniture.',
  keywords: 'luxury sofas, Indian furniture, Artech Furniture, handcrafted sofas, teak wood, sheesham wood',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
