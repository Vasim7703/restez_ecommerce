import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────────────────────
// Browser / universal Supabase client
// Safe to import in both client and server components.
// Reads NEXT_PUBLIC_ vars which are embedded at build time.
// ─────────────────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─────────────────────────────────────────────────────────────────────────────
// Server-side Supabase client factory (using @supabase/ssr)
//
// Usage (in Server Components or API routes):
//   import { createServerSupabaseClient } from '@/lib/supabase'
//   const client = createServerSupabaseClient()
//   const { data } = await client.from('products').select('*')
//
// This client uses the anon key with no cookie context, suitable for
// read-only public data or queries protected by RLS via service role.
// For user-authenticated server requests, pass the user's cookies via
// @supabase/ssr's createServerClient with cookie helpers.
// ─────────────────────────────────────────────────────────────────────────────
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.'
    )
  }

  return createClient(url, key)
}

// ─────────────────────────────────────────────────────────────────────────────
// Database types
// ─────────────────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  base_price: number
  category: string
  collection: string
  material: string
  seating_capacity: number
  style: string
  dimensions: {
    length: number
    width: number
    height: number
  }
  fabric_options: {
    standard: string[]
    premium: string[]
  }
  premium_upcharge: number
  images: {
    main: string
    front: string
    angle_45: string
    side: string
    back: string
    closeup: string
    lifestyle: string[]
  }
  /** Map of fabric name → image URL. When set, product page shows the real fabric photo instead of a CSS overlay. */
  fabric_images: Record<string, string>
  in_stock: boolean
  featured: boolean
  reviews?: Review[]
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  date: string
  verified_purchase: boolean
}

export interface UserAddress {
  id: string
  name: string
  phone: string
  street: string
  city: string
  state: string
  pincode: string
  is_default: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  selected_fabric: string
  fabric_type: 'standard' | 'premium'
  total_price: number
}

export interface Order {
  id: string
  customer_name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
  }
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  status: 'pending' | 'manufacturing' | 'quality_check' | 'shipped' | 'delivered'
  payment_method: string
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  discount_percentage: number
  valid_until: string
  active: boolean
}
