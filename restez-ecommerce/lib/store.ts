import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from './supabase'

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
