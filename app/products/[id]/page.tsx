"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProductDetail } from "../../../components/products/ProductDetail"
import { mockProducts } from "../../../data/products"
import type { Product } from "../../../types"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const productId = params.id as string
    
    if (productId) {
      // Simulate API call
      setTimeout(() => {
        const foundProduct = mockProducts.find(p => p.id === productId)
        setProduct(foundProduct || null)
        setLoading(false)
      }, 500)
    }
  }, [params.id])

  const handleBackToProducts = () => {
    router.push('/products')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-96 bg-gray-200 rounded" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 w-16 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="h-12 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
        <p className="text-muted-foreground mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button
          onClick={handleBackToProducts}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-md"
        >
          Quay lại danh sách sản phẩm
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail 
        product={product} 
        onBack={handleBackToProducts}
      />
    </div>
  )
}