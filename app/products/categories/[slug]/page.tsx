"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { SimpleProductGrid } from "../../../../components/products/SimpleProductGrid"
import { ProductFilter } from "../../../../components/products/ProductFilter"
import { getProductsByCategory, getCategories, getCategoryIcon } from "../../../../data/products"
import type { ProductFilters } from "../../../../types"
import { applyProductFilters } from "../../../../utils"

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [filters, setFilters] = useState<ProductFilters>({})

  const categories = getCategories()
  const currentCategory = categories.find(cat => cat.slug === slug)

  // Get products for this category
  const categoryProducts = useMemo(() => {
    return getProductsByCategory(slug)
  }, [slug])

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    return applyProductFilters(categoryProducts, filters)
  }, [categoryProducts, filters])

  const handleFiltersChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  if (!currentCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Danh mục không tồn tại</h1>
          <Button onClick={() => router.push('/products')}>
            Quay lại sản phẩm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/products')}
          className="mb-4 p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại tất cả sản phẩm
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{currentCategory.icon}</span>
          <div>
            <h1 className="text-3xl font-bold">{currentCategory.name}</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} sản phẩm • Trầm Hân Agarwood
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filter */}
        <div className="lg:col-span-1">
          <ProductFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            products={categoryProducts}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <SimpleProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{currentCategory.icon}</div>
              <h2 className="text-xl font-semibold mb-2">Không có sản phẩm nào</h2>
              <p className="text-muted-foreground mb-4">
                Hiện tại chúng tôi chưa có sản phẩm nào trong danh mục này.
              </p>
              <Button onClick={handleClearFilters} variant="outline">
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getCategories()

  return categories.map((category) => ({
    slug: category.slug,
  }))
}