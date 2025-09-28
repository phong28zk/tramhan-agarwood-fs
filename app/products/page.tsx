"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { SimpleProductGrid } from "../../components/products/SimpleProductGrid"
import { ProductFilter } from "../../components/products/ProductFilter"
import { mockProducts, getCategories, getProductsByCategory } from "../../data/products"
import type { ProductFilters } from "../../types"
import { applyProductFilters } from "../../utils"

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category") || "all"

  const [filters, setFilters] = useState<ProductFilters>({})

  const categories = getCategories()

  // Get products based on active category
  const categoryProducts = useMemo(() => {
    if (activeCategory === "all") {
      return mockProducts
    }
    return getProductsByCategory(activeCategory)
  }, [activeCategory])

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    return applyProductFilters(categoryProducts, filters)
  }, [categoryProducts, filters])

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === "all") {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleFiltersChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Sản phẩm</h1>
        <p className="text-muted-foreground">
          Khám phá bộ sưu tập trầm hương và phong thủy cao cấp của Trầm Hân
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <span>🌟</span>
            <span className="hidden sm:inline">Tất cả</span>
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category.slug}
              value={category.slug}
              className="flex items-center gap-2"
            >
              <span>{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
              <span className="hidden lg:inline">({category.count})</span>
            </TabsTrigger>
          ))}
        </TabsList>

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
            <TabsContent value="all" className="mt-0">
              <SimpleProductGrid products={filteredProducts} />
            </TabsContent>
            {categories.map((category) => (
              <TabsContent key={category.slug} value={category.slug} className="mt-0">
                <SimpleProductGrid products={filteredProducts} />
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  )
}