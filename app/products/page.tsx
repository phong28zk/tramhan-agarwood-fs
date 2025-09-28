"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProductGrid } from "../../components/products/ProductGrid"
import { mockProducts } from "../../data/products"
import { useProductsStore } from "../../store"
import type { Product } from "../../types"

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { products, loading, setProducts, setLoading } = useProductsStore()
  const router = useRouter()

  useEffect(() => {
    // Simulate loading products
    setLoading(true)

    // In a real app, this would be an API call
    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [setProducts, setLoading])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    // Navigate to product detail page using Next.js router
    router.push(`/products/${product.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGrid products={products} loading={loading} onProductClick={handleProductClick} />
    </div>
  )
}
