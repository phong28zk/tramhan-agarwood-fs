import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product, CartItem, Cart, ProductFilters, UIState, User, ShippingAddress, PromoCode } from "../types"
import { calculateShippingFee, calculateTax, validatePromoCode } from "../utils"

// Cart Store
interface CartStore extends Cart {
  addItem: (product: Product, quantity?: number, selectedVariant?: any) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  applyPromoCode: (code: string) => void
  removePromoCode: () => void
  updateShipping: (address: ShippingAddress) => void
  recalculateTotal: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 0,
      itemCount: 0,
      promoCode: undefined,

      addItem: (product, quantity = 1, selectedVariant) => {
        const state = get()
        const existingItemIndex = state.items.findIndex(
          (item) => item.product.id === product.id && item.selectedVariant?.id === selectedVariant?.id,
        )

        let newItems
        if (existingItemIndex >= 0) {
          newItems = [...state.items]
          newItems[existingItemIndex].quantity += quantity
        } else {
          const newItem: CartItem = {
            product,
            quantity,
            selectedVariant,
            addedAt: new Date(),
          }
          newItems = [...state.items, newItem]
        }

        set({ items: newItems })
        get().recalculateTotal()
      },

      removeItem: (productId, variantId) => {
        const state = get()
        const newItems = state.items.filter(
          (item) => !(item.product.id === productId && item.selectedVariant?.id === variantId),
        )
        set({ items: newItems })
        get().recalculateTotal()
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }

        const state = get()
        const newItems = state.items.map((item) => {
          if (item.product.id === productId && item.selectedVariant?.id === variantId) {
            return { ...item, quantity }
          }
          return item
        })
        set({ items: newItems })
        get().recalculateTotal()
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          shipping: 0,
          tax: 0,
          discount: 0,
          total: 0,
          itemCount: 0,
          promoCode: undefined,
        })
      },

      applyPromoCode: (code) => {
        // This would normally validate against a real promo codes list
        const mockPromoCodes: PromoCode[] = [
          {
            code: "TRAMHAN10",
            type: "percentage",
            value: 10,
            minOrderValue: 200000,
            maxDiscount: 100000,
            usedCount: 0,
          },
          {
            code: "FREESHIP",
            type: "fixed",
            value: 30000,
            minOrderValue: 300000,
            usedCount: 0,
          },
        ]

        const state = get()
        const validation = validatePromoCode(code, state.subtotal, mockPromoCodes)

        if (validation.valid) {
          set({
            promoCode: code,
            discount: validation.discount,
          })
          get().recalculateTotal()
        } else {
          // Handle error - would show toast in real app
          console.error(validation.error)
        }
      },

      removePromoCode: () => {
        set({ promoCode: undefined, discount: 0 })
        get().recalculateTotal()
      },

      updateShipping: (address) => {
        const state = get()
        const totalWeight = state.items.reduce(
          (weight, item) => weight + (item.product.weight || 0.5) * item.quantity,
          0,
        )
        const shipping = calculateShippingFee(totalWeight, address.province, state.subtotal)
        set({ shipping })
        get().recalculateTotal()
      },

      recalculateTotal: () => {
        const state = get()
        const subtotal = state.items.reduce((sum, item) => {
          const price = item.selectedVariant?.price || item.product.price
          return sum + price * item.quantity
        }, 0)

        const tax = calculateTax(subtotal)
        const total = subtotal + state.shipping + tax - state.discount
        const itemCount = state.items.reduce((count, item) => count + item.quantity, 0)

        set({
          subtotal,
          tax,
          total: Math.max(0, total),
          itemCount,
        })
      },
    }),
    {
      name: "tram-han-cart",
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
      }),
    },
  ),
)

// Products Store
interface ProductsStore {
  products: Product[]
  categories: string[]
  filters: ProductFilters
  loading: boolean
  error: string | null
  setProducts: (products: Product[]) => void
  setFilters: (filters: Partial<ProductFilters>) => void
  clearFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useProductsStore = create<ProductsStore>((set) => ({
  products: [],
  categories: [],
  filters: {},
  loading: false,
  error: null,

  setProducts: (products) => {
    const categories = Array.from(new Set(products.map((p) => p.category)))
    set({ products, categories })
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

// UI Store
interface UIStore extends UIState {
  setCartOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setCurrentPage: (page: string) => void
  showToast: (message: string, type: UIState["toast"]["type"], duration?: number) => void
  hideToast: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  loading: false,
  currentPage: "/",
  toast: undefined,

  setCartOpen: (open) => set({ cartOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setLoading: (loading) => set({ loading }),
  setCurrentPage: (page) => set({ currentPage: page }),

  showToast: (message, type, duration = 5000) => {
    set({ toast: { message, type, duration } })
    setTimeout(() => set({ toast: undefined }), duration)
  },

  hideToast: () => set({ toast: undefined }),
}))

// User Store
interface UserStore {
  user: User | null
  addresses: ShippingAddress[]
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  addAddress: (address: ShippingAddress) => void
  updateAddress: (index: number, address: ShippingAddress) => void
  removeAddress: (index: number) => void
  setDefaultAddress: (index: number) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      addresses: [],
      isAuthenticated: false,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          addresses: user?.addresses || [],
        })
      },

      addAddress: (address) => {
        const state = get()
        const newAddresses = [...state.addresses, address]
        set({ addresses: newAddresses })

        if (state.user) {
          set({
            user: { ...state.user, addresses: newAddresses },
          })
        }
      },

      updateAddress: (index, address) => {
        const state = get()
        const newAddresses = [...state.addresses]
        newAddresses[index] = address
        set({ addresses: newAddresses })

        if (state.user) {
          set({
            user: { ...state.user, addresses: newAddresses },
          })
        }
      },

      removeAddress: (index) => {
        const state = get()
        const newAddresses = state.addresses.filter((_, i) => i !== index)
        set({ addresses: newAddresses })

        if (state.user) {
          set({
            user: { ...state.user, addresses: newAddresses },
          })
        }
      },

      setDefaultAddress: (index) => {
        const state = get()
        const newAddresses = state.addresses.map((addr, i) => ({
          ...addr,
          isDefault: i === index,
        }))
        set({ addresses: newAddresses })

        if (state.user) {
          set({
            user: { ...state.user, addresses: newAddresses },
          })
        }
      },
    }),
    {
      name: "tram-han-user",
    },
  ),
)
