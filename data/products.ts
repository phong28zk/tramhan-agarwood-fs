import type { Product } from "../types"

// Mock product data for development
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Trầm Hương Kỳ Nam Cao Cấp",
    description: "Trầm hương kỳ nam thiên nhiên, hương thơm thanh tao, mang lại bình an và thịnh vượng cho gia đình.",
    price: 2500000,
    images: ["/premium-agarwood-incense-sticks.jpg", "/agarwood-incense-burning.jpg", "/agarwood-incense-packaging.jpg"],
    category: "Trầm Hương",
    fengShuiProperties: {
      element: "wood",
      energyLevel: 5,
      benefits: ["Thanh lọc không gian", "Mang lại bình an", "Tăng cường tài lộc"],
      placement: "Phòng thờ, phòng khách, phòng làm việc",
      usage: "Đốt 1-2 que mỗi ngày vào buổi sáng hoặc tối",
      compatibility: ["Mệnh Mộc", "Mệnh Thủy", "Mệnh Hỏa"],
    },
    inStock: true,
    stockQuantity: 50,
    weight: 0.2,
    dimensions: { length: 20, width: 5, height: 5 },
    tags: ["trầm hương", "kỳ nam", "cao cấp", "phong thủy"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Vòng Tay Trầm Hương 108 Hạt",
    description: "Vòng tay trầm hương 108 hạt, giúp tĩnh tâm, an thần và mang lại may mắn.",
    price: 850000,
    images: ["/agarwood-prayer-beads-bracelet-108.jpg", "/wooden-prayer-beads-on-hand.jpg", "/buddhist-prayer-beads-close-up.jpg"],
    category: "Vòng Tay",
    fengShuiProperties: {
      element: "wood",
      energyLevel: 4,
      benefits: ["Tĩnh tâm an thần", "Tăng cường trí tuệ", "Bảo vệ khỏi tà khí"],
      placement: "Đeo tay trái để nhận năng lượng tích cực",
      usage: "Đeo hàng ngày, có thể sử dụng để niệm Phật",
      compatibility: ["Mọi mệnh", "Đặc biệt tốt cho mệnh Mộc"],
    },
    inStock: true,
    stockQuantity: 25,
    variants: [
      { id: "v1", name: "8mm", price: 850000, stockQuantity: 15, attributes: { size: "8mm" } },
      { id: "v2", name: "10mm", price: 950000, stockQuantity: 10, attributes: { size: "10mm" } },
    ],
    weight: 0.1,
    dimensions: { length: 25, width: 25, height: 1 },
    tags: ["vòng tay", "trầm hương", "108 hạt", "phật giáo"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    name: "Tượng Phật Di Lặc Gỗ Trầm",
    description: "Tượng Phật Di Lặc được chạm khắc tinh xảo từ gỗ trầm hương, mang lại hạnh phúc và thịnh vượng.",
    price: 3200000,
    images: ["/laughing-buddha-statue-agarwood.jpg", "/wooden-buddha-statue-carved.jpg", "/feng-shui-buddha-statue.jpg"],
    category: "Tượng Phong Thủy",
    fengShuiProperties: {
      element: "earth",
      energyLevel: 5,
      benefits: ["Mang lại hạnh phúc", "Thu hút tài lộc", "Xua đuổi tà khí"],
      placement: "Phòng khách, bàn làm việc, hướng về cửa chính",
      usage: "Đặt ở vị trí cao, thường xuyên lau chùi sạch sẽ",
      compatibility: ["Mệnh Thổ", "Mệnh Kim", "Mệnh Hỏa"],
    },
    inStock: true,
    stockQuantity: 8,
    weight: 1.5,
    dimensions: { length: 15, width: 12, height: 20 },
    tags: ["tượng phật", "di lặc", "gỗ trầm", "phong thủy"],
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  },
  {
    id: "4",
    name: "Lư Hương Đồng Cổ Điển",
    description: "Lư hương bằng đồng thiết kế cổ điển, dùng để đốt trầm hương, tạo không gian thiêng liêng.",
    price: 680000,
    images: ["/bronze-incense-burner-traditional.jpg", "/antique-incense-holder-copper.jpg", "/feng-shui-incense-burner.jpg"],
    category: "Đồ Trang Trí",
    fengShuiProperties: {
      element: "metal",
      energyLevel: 3,
      benefits: ["Thanh lọc không khí", "Tạo không gian thiêng liêng", "Hỗ trợ thiền định"],
      placement: "Bàn thờ, phòng thiền, phòng khách",
      usage: "Đặt trầm hương vào lư và đốt, đảm bảo thông gió",
      compatibility: ["Mệnh Kim", "Mệnh Thổ", "Mệnh Thủy"],
    },
    inStock: true,
    stockQuantity: 15,
    weight: 0.8,
    dimensions: { length: 12, width: 12, height: 8 },
    tags: ["lư hương", "đồng", "cổ điển", "phụ kiện"],
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "5",
    name: "Nhẫn Trầm Hương Nam",
    description: "Nhẫn nam được làm từ gỗ trầm hương tự nhiên, thiết kế đơn giản, thanh lịch.",
    price: 450000,
    images: ["/agarwood-ring-for-men.jpg", "/wooden-ring-natural-grain.jpg", "/mens-wooden-jewelry-ring.jpg"],
    category: "Nhẫn Phong Thủy",
    fengShuiProperties: {
      element: "wood",
      energyLevel: 2,
      benefits: ["Tăng cường sức khỏe", "Mang lại may mắn", "Cân bằng năng lượng"],
      placement: "Đeo ngón tay áp út hoặc ngón giữa",
      usage: "Đeo hàng ngày, tránh tiếp xúc với nước nhiều",
      compatibility: ["Mệnh Mộc", "Mệnh Thủy"],
    },
    inStock: true,
    stockQuantity: 30,
    variants: [
      { id: "r1", name: "Size 7", price: 450000, stockQuantity: 10, attributes: { size: "7" } },
      { id: "r2", name: "Size 8", price: 450000, stockQuantity: 12, attributes: { size: "8" } },
      { id: "r3", name: "Size 9", price: 450000, stockQuantity: 8, attributes: { size: "9" } },
    ],
    weight: 0.05,
    dimensions: { length: 2, width: 2, height: 0.5 },
    tags: ["nhẫn", "trầm hương", "nam", "trang sức"],
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
  },
  {
    id: "6",
    name: "Chuỗi Trầm Hương 54 Hạt",
    description: "Chuỗi trầm hương 54 hạt, kích thước vừa phải, phù hợp để đeo cổ hoặc cầm tay.",
    price: 1200000,
    images: ["/agarwood-necklace-54-beads.jpg", "/wooden-prayer-beads-necklace.jpg", "/buddhist-mala-beads.jpg"],
    category: "Phụ Kiện",
    fengShuiProperties: {
      element: "wood",
      energyLevel: 4,
      benefits: ["Bảo vệ sức khỏe", "Tăng cường tâm linh", "Xua đuổi vận xui"],
      placement: "Đeo cổ hoặc cầm tay khi thiền định",
      usage: "Có thể đeo hàng ngày hoặc sử dụng khi niệm Phật",
      compatibility: ["Mọi mệnh", "Đặc biệt tốt cho người tu hành"],
    },
    inStock: true,
    stockQuantity: 18,
    weight: 0.15,
    dimensions: { length: 80, width: 1, height: 1 },
    tags: ["chuỗi", "trầm hương", "54 hạt", "phụ kiện"],
    createdAt: new Date("2024-01-06"),
    updatedAt: new Date("2024-01-06"),
  },
]

// Category mapping for slugs
export const categorySlugMap = {
  "Trầm Hương": "tram-huong",
  "Vòng Tay": "vong-tay",
  "Tượng Phong Thủy": "tuong-phong-thuy",
  "Đồ Trang Trí": "do-trang-tri",
  "Nhẫn Phong Thủy": "nhan-phong-thuy",
  "Phụ Kiện": "phu-kien"
} as const

export type CategorySlug = typeof categorySlugMap[keyof typeof categorySlugMap]

// Get all unique categories
export const getCategories = () => {
  const categories = Array.from(new Set(mockProducts.map(p => p.category)))
  return categories.map(category => ({
    name: category,
    slug: categorySlugMap[category as keyof typeof categorySlugMap],
    icon: getCategoryIcon(category),
    image: getCategoryImage(category),
    count: mockProducts.filter(p => p.category === category).length
  }))
}

// Get category icon
export const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    "Trầm Hương": "🪵",
    "Vòng Tay": "📿",
    "Tượng Phong Thủy": "🧘",
    "Đồ Trang Trí": "🏺",
    "Nhẫn Phong Thủy": "💍",
    "Phụ Kiện": "✨"
  }
  return iconMap[category] || "🏮"
}

// Get category image
export const getCategoryImage = (category: string) => {
  const imageMap: Record<string, string> = {
    "Trầm Hương": "/tram-huong.png",
    "Vòng Tay": "/vong-tay.png",
    "Tượng Phong Thủy": "/tuong-phong-thuy.png",
    "Đồ Trang Trí": "/do-trang-tri.png",
    "Nhẫn Phong Thủy": "/nhan-phong-thuy.png",
    "Phụ Kiện": "/phu-kien.png"
  }
  return imageMap[category] || "/category-default.svg"
}

// Get products by category slug
export const getProductsByCategory = (slug: string) => {
  const categoryName = Object.keys(categorySlugMap).find(
    key => categorySlugMap[key as keyof typeof categorySlugMap] === slug
  )

  if (!categoryName) return []

  return mockProducts.filter(product => product.category === categoryName)
}

// Mock promo codes
export const mockPromoCodes = [
  {
    code: "TRAMHAN10",
    type: "percentage" as const,
    value: 10,
    minOrderValue: 500000,
    maxDiscount: 200000,
    expiresAt: new Date("2024-12-31"),
    usageLimit: 100,
    usedCount: 25,
  },
  {
    code: "FREESHIP",
    type: "fixed" as const,
    value: 30000,
    minOrderValue: 300000,
    expiresAt: new Date("2024-12-31"),
    usageLimit: 200,
    usedCount: 45,
  },
  {
    code: "NEWCUSTOMER",
    type: "percentage" as const,
    value: 15,
    minOrderValue: 200000,
    maxDiscount: 150000,
    expiresAt: new Date("2024-12-31"),
    usageLimit: 50,
    usedCount: 12,
  },
]
