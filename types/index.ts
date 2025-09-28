// Core Product Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: ProductCategory
  fengShuiProperties?: FengShuiInfo
  inStock: boolean
  stockQuantity: number
  variants?: ProductVariant[]
  weight?: number // for shipping calculation
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  stockQuantity: number
  attributes: Record<string, string> // size, color, etc.
}

export interface FengShuiInfo {
  element: "wood" | "fire" | "earth" | "metal" | "water"
  energyLevel: 1 | 2 | 3 | 4 | 5
  benefits: string[]
  placement: string
  usage: string
  compatibility: string[]
}

// Product Categories (Vietnamese feng shui terms)
export type ProductCategory = 
  | "Trầm Hương" // Agarwood/Incense
  | "Vòng Tay" // Bracelets  
  | "Tượng Phong Thủy" // Feng Shui Statues
  | "Đồ Trang Trí" // Decorative Items
  | "Nhẫn Phong Thủy" // Feng Shui Rings
  | "Phụ Kiện" // Accessories

// Cart Types
export interface CartItem {
  product: Product
  quantity: number
  selectedVariant?: ProductVariant
  addedAt: Date
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  itemCount: number
  promoCode?: string
}

// Order Types
export interface Order {
  id: string
  items: CartItem[]
  shippingInfo: ShippingAddress
  paymentMethod: PaymentMethod
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  status: OrderStatus
  trackingNumber?: string
  notes?: string
  paymentIntent?: {
    clientSecret: string
    id: string
  }
  createdAt: Date
  updatedAt: Date
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

// Vietnamese Address System
export interface ShippingAddress {
  fullName: string
  phone: string
  email?: string
  address: string
  ward: string // Xã/Phường
  district: string // Quận/Huyện
  province: string // Tỉnh/Thành phố
  postalCode?: string
  isDefault?: boolean
}

// Payment Types
export interface PaymentMethod {
  type: "stripe" | "vnpay" | "momo" | "zalopay" | "cod" | "bank_transfer"
  details: StripePayment | VietnamPayment | CODPayment | BankTransferPayment
}

export interface StripePayment {
  cardLast4?: string
  cardBrand?: string
  paymentIntentId?: string
}

export interface VietnamPayment {
  gateway: "vnpay" | "momo" | "zalopay"
  transactionId?: string
  bankCode?: string
  qrCode?: string
}

export interface CODPayment {
  fee: number
  instructions: string
}

export interface BankTransferPayment {
  bankName: string
  accountNumber: string
  accountName: string
  transferCode: string
}

// Filter and Search Types
export interface ProductFilters {
  category?: ProductCategory
  priceRange?: {
    min: number
    max: number
  }
  fengShuiElement?: string
  inStock?: boolean
  sortBy?: "name" | "price" | "date" | "popularity"
  sortOrder?: "asc" | "desc"
  searchQuery?: string
}

// User Types
export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  addresses: ShippingAddress[]
  orderHistory: Order[]
  preferences: {
    language: "vi" | "en"
    currency: "VND" | "USD"
    notifications: boolean
  }
  createdAt: Date
}

// UI State Types
export interface UIState {
  cartOpen: boolean
  mobileMenuOpen: boolean
  loading: boolean
  currentPage: string
  toast?: {
    message: string
    type: "success" | "error" | "warning" | "info"
    duration?: number
  }
}

// Error Types
export interface AppError {
  type: "network" | "payment" | "validation" | "server" | "auth"
  message: string
  code?: string
  details?: any
}

// Promo Code Types
export interface PromoCode {
  code: string
  type: "percentage" | "fixed"
  value: number
  minOrderValue?: number
  maxDiscount?: number
  expiresAt?: Date
  usageLimit?: number
  usedCount: number
}

// Payment Result Types
export interface PaymentResult {
  success: boolean
  transactionId?: string
  orderId?: string
  paymentMethod?: string
  error?: string
  errorCode?: string
}

// QR Code Payment Types
export interface PaymentQRData {
  amount: number
  currency: 'VND'
  orderId: string
  description: string
  methods: string[]
  timestamp: string
}

export interface QRCodeGeneratorProps {
  amount: number
  orderId?: string
  paymentMethods?: string[]
}

// Enhanced Cart Store with Debugging
export interface EnhancedCartStore extends Cart {
  // Add debugging methods
  logCartState: () => void
  validateCalculations: () => boolean

  // Enhanced calculation method
  recalculateTotal: () => void
}

// Debug Information Types
export interface DebugInfo {
  timestamp: string
  userAgent: string
  url: string
  viewport: {
    width: number
    height: number
  }
}

// Form Validation Types
export interface ValidationResult {
  valid: boolean
  errors?: Record<string, string>
  data?: any
}

// Checkout Debug Types
export interface CheckoutDebugState {
  currentStep: string
  formData?: any
  validationState?: any
  errors?: any[]
  timestamp: string
}
