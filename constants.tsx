export { OrderStatus } from "./types/index"

// Vietnamese Business Information
export const BUSINESS_INFO = {
  name: "Trầm Hân Agarwood",
  tagline: "Tinh hoa phong thủy Việt Nam",
  phone: "+84 90 123 4567",
  email: "info@tramhan.vn",
  address: "123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  hours: "T2-T6: 8:00-18:00, T7-CN: 9:00-17:00",
}

// Shipping Configuration
export const SHIPPING_CONFIG = {
  freeShippingThreshold: 500000, // 500,000 VND
  standardShippingFee: 30000, // 30,000 VND
  expressShippingFee: 50000, // 50,000 VND
}

// Payment Configuration
export const PAYMENT_CONFIG = {
  supportedMethods: ["stripe", "vnpay", "momo", "zalopay", "cod", "bank_transfer"],
  codFee: 15000, // 15,000 VND
}

// Product Configuration
export const PRODUCT_CONFIG = {
  maxImagesPerProduct: 10,
  maxVariantsPerProduct: 20,
  defaultCurrency: "VND",
  defaultLanguage: "vi",
}
