// Vietnamese Currency Formatting
export const formatVNDCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Vietnamese Phone Number Validation
export const validateVietnamesePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

// Vietnamese Text Search (with diacritics support)
export const normalizeVietnameseText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
}

// Search Products
export const searchProducts = (products: any[], query: string): any[] => {
  if (!query.trim()) return products

  const normalizedQuery = normalizeVietnameseText(query)

  return products.filter((product) => {
    const normalizedName = normalizeVietnameseText(product.name)
    const normalizedDescription = normalizeVietnameseText(product.description)
    const normalizedTags = product.tags?.map((tag: string) => normalizeVietnameseText(tag)).join(" ") || ""

    return (
      normalizedName.includes(normalizedQuery) ||
      normalizedDescription.includes(normalizedQuery) ||
      normalizedTags.includes(normalizedQuery)
    )
  })
}

// Feng Shui Element Colors
export const getFengShuiElementColor = (element: string): string => {
  const elementColors = {
    wood: "text-green-600 bg-green-50 border-green-200", // Mộc
    fire: "text-red-600 bg-red-50 border-red-200", // Hỏa
    earth: "text-yellow-600 bg-yellow-50 border-yellow-200", // Thổ
    metal: "text-gray-600 bg-gray-50 border-gray-200", // Kim
    water: "text-blue-600 bg-blue-50 border-blue-200", // Thủy
  }
  return elementColors[element as keyof typeof elementColors] || "text-gray-600 bg-gray-50 border-gray-200"
}

// Vietnamese Provinces Data
export const vietnameseProvinces = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
]

// Calculate Shipping Fee
export const calculateShippingFee = (weight: number, province: string, orderValue: number): number => {
  // Free shipping for orders over 500,000 VND
  if (orderValue >= 500000) return 0

  // Base shipping fee
  const baseFee = 30000 // 30,000 VND

  // Weight-based fee (per kg)
  const weightFee = Math.ceil(weight) * 10000 // 10,000 VND per kg

  // Province-based fee
  const remoteFee = isRemoteProvince(province) ? 20000 : 0 // 20,000 VND for remote areas

  return baseFee + weightFee + remoteFee
}

// Check if province is remote (higher shipping cost)
const isRemoteProvince = (province: string): boolean => {
  const remoteProvinces = [
    "Cao Bằng",
    "Hà Giang",
    "Lào Cai",
    "Lai Châu",
    "Sơn La",
    "Điện Biên",
    "Bắc Kạn",
    "Tuyên Quang",
    "Kon Tum",
    "Gia Lai",
    "Đắk Lắk",
    "Đắk Nông",
    "Cà Mau",
    "An Giang",
    "Kiên Giang",
  ]
  return remoteProvinces.includes(province)
}

// Calculate Tax (10% VAT)
export const calculateTax = (subtotal: number): number => {
  return Math.round(subtotal * 0.1)
}

// Generate Order ID
export const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `TH${timestamp}${random}`.toUpperCase()
}

// Format Date in Vietnamese
export const formatVietnameseDate = (date: Date): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Validate Promo Code
export const validatePromoCode = (
  code: string,
  orderValue: number,
  promoCodes: any[],
): { valid: boolean; discount: number; error?: string } => {
  const promo = promoCodes.find((p) => p.code.toLowerCase() === code.toLowerCase())

  if (!promo) {
    return { valid: false, discount: 0, error: "Mã giảm giá không tồn tại" }
  }

  if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
    return { valid: false, discount: 0, error: "Mã giảm giá đã hết hạn" }
  }

  if (promo.minOrderValue && orderValue < promo.minOrderValue) {
    return {
      valid: false,
      discount: 0,
      error: `Đơn hàng tối thiểu ${formatVNDCurrency(promo.minOrderValue)}`,
    }
  }

  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return { valid: false, discount: 0, error: "Mã giảm giá đã hết lượt sử dụng" }
  }

  let discount = 0
  if (promo.type === "percentage") {
    discount = Math.round(orderValue * (promo.value / 100))
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount
    }
  } else {
    discount = promo.value
  }

  return { valid: true, discount }
}

// Debounce function for search
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Apply Product Filters
export const applyProductFilters = (products: any[], filters: any): any[] => {
  let filteredProducts = [...products]

  // Search query filter
  if (filters.searchQuery) {
    filteredProducts = searchProducts(filteredProducts, filters.searchQuery)
  }

  // Category filter
  if (filters.category) {
    filteredProducts = filteredProducts.filter(product => product.category === filters.category)
  }

  // Price range filter
  if (filters.priceRange) {
    filteredProducts = filteredProducts.filter(product =>
      product.price >= filters.priceRange.min && product.price <= filters.priceRange.max
    )
  }

  // Feng shui element filter
  if (filters.fengShuiElement) {
    filteredProducts = filteredProducts.filter(product =>
      product.fengShuiProperties?.element === filters.fengShuiElement
    )
  }

  // In stock filter
  if (filters.inStock) {
    filteredProducts = filteredProducts.filter(product => product.inStock === true)
  }

  // Sort products
  if (filters.sortBy) {
    filteredProducts.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'vi')
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case 'popularity':
          // Assume popularity based on stock quantity (lower = more popular)
          comparison = a.stockQuantity - b.stockQuantity
          break
        default:
          return 0
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })
  }

  return filteredProducts
}
