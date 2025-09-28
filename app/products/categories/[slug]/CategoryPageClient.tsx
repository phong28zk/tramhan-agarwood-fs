"use client"

import { useState, useMemo } from "react"
import { Button } from "../../../../components/ui/button"
import { SimpleProductGrid } from "../../../../components/products/SimpleProductGrid"
import { ProductFilter } from "../../../../components/products/ProductFilter"
import type { Product, ProductFilters } from "../../../../types"
import { applyProductFilters } from "../../../../utils"

interface CategoryPageClientProps {
  currentCategory: {
    name: string
    slug: string
    icon: string
    count: number
  }
  categoryProducts: Product[]
}

export function CategoryPageClient({ currentCategory, categoryProducts }: CategoryPageClientProps) {
  const [filters, setFilters] = useState<ProductFilters>({})

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

  return (
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
  )
}