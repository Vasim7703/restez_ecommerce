import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from './supabase'

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthUser {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
}

interface AuthStore {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'restez-auth' }
  )
)

// Mock customer accounts (in real app, these come from DB)
export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Arjun Sharma', email: 'arjun@example.com', password: 'customer123', role: 'customer' as const },
  { id: 'c2', name: 'Priya Patel', email: 'priya@example.com', password: 'customer123', role: 'customer' as const },
]

// Mock admin account
export const MOCK_ADMIN = { id: 'a1', name: 'Admin', email: 'admin@restez.com', password: 'admin@restez123', role: 'admin' as const }

interface CartStore {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (item) => {
        const items = get().items
        const existingItem = items.find(
          i => i.product.id === item.product.id && i.selected_fabric === item.selected_fabric
        )
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.product.id === item.product.id && i.selected_fabric === item.selected_fabric
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...items, item] })
        }
      },
      
      removeFromCart: (productId) => {
        set({ items: get().items.filter(i => i.product.id !== productId) })
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
        } else {
          set({
            items: get().items.map(i =>
              i.product.id === productId ? { ...i, quantity } : i
            ),
          })
        }
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.total_price * item.quantity, 0)
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'restez-cart',
    }
  )
)

interface FilterStore {
  priceRange: [number, number]
  materials: string[]
  seatingCapacity: number[]
  styles: string[]
  setPriceRange: (range: [number, number]) => void
  toggleMaterial: (material: string) => void
  toggleSeatingCapacity: (capacity: number) => void
  toggleStyle: (style: string) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  priceRange: [0, 500000],
  materials: [],
  seatingCapacity: [],
  styles: [],
  
  setPriceRange: (range) => set({ priceRange: range }),
  
  toggleMaterial: (material) =>
    set((state) => ({
      materials: state.materials.includes(material)
        ? state.materials.filter(m => m !== material)
        : [...state.materials, material],
    })),
  
  toggleSeatingCapacity: (capacity) =>
    set((state) => ({
      seatingCapacity: state.seatingCapacity.includes(capacity)
        ? state.seatingCapacity.filter(c => c !== capacity)
        : [...state.seatingCapacity, capacity],
    })),
  
  toggleStyle: (style) =>
    set((state) => ({
      styles: state.styles.includes(style)
        ? state.styles.filter(s => s !== style)
        : [...state.styles, style],
    })),
  
  clearFilters: () =>
    set({
      priceRange: [0, 500000],
      materials: [],
      seatingCapacity: [],
      styles: [],
    }),
}))

interface WishlistStore {
  items: Product[]
  toggleWishlist: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggleWishlist: (product) => {
        const items = get().items
        if (items.find(i => i.id === product.id)) {
          set({ items: items.filter(i => i.id !== product.id) })
        } else {
          set({ items: [...items, product] })
        }
      },
      
      isInWishlist: (productId) => {
        return get().items.some(i => i.id === productId)
      },
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'restez-wishlist',
    }
  )
)

import { Order, UserAddress } from './supabase'

interface UserMetaStore {
  orders: Order[]
  addresses: UserAddress[]
  addOrder: (order: Order) => void
  addAddress: (address: Omit<UserAddress, 'id'>) => void
  removeAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
}

export const useUserMetaStore = create<UserMetaStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addresses: [],
      
      addOrder: (order) => {
        set({ orders: [order, ...get().orders] })
      },
      
      addAddress: (address) => {
        const id = String(Date.now())
        const newAddress = { ...address, id }
        const currentAddresses = get().addresses
        
        if (currentAddresses.length === 0 || address.is_default) {
          // If this is the first address or marked as default, make others not default
          set({ 
            addresses: [
              newAddress, 
              ...currentAddresses.map(a => ({ ...a, is_default: false }))
            ] 
          })
        } else {
          set({ addresses: [...currentAddresses, newAddress] })
        }
      },
      
      removeAddress: (id) => {
        set({ addresses: get().addresses.filter(a => a.id !== id) })
      },
      
      setDefaultAddress: (id) => {
        set({
          addresses: get().addresses.map(a => 
            a.id === id ? { ...a, is_default: true } : { ...a, is_default: false }
          )
        })
      }
    }),
    {
      name: 'restez-user-meta'
    }
  )
)

interface CompareStore {
  items: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: string) => void
  clearCompare: () => void
  isInCompare: (productId: string) => boolean
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCompare: (product) => {
        const items = get().items
        if (items.length < 3 && !items.find(i => i.id === product.id)) {
          set({ items: [...items, product] })
        }
      },
      removeFromCompare: (productId) => {
        set({ items: get().items.filter(i => i.id !== productId) })
      },
      clearCompare: () => set({ items: [] }),
      isInCompare: (productId) => get().items.some(i => i.id === productId),
    }),
    { name: 'restez-compare' }
  )
)
