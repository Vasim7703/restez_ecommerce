import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
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
  in_stock: boolean
  featured: boolean
  created_at: string
  updated_at: string
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
